package notes.http.routes

import cats.effect.IO
import cats.effect.testing.scalatest.AsyncIOSpec

import io.circe.Json
import io.circe.syntax.*

import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.implicits.*
import org.scalatest.freespec.AsyncFreeSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID

import notes.core.{Notes, RateLimiter}
import notes.domain.note.{Note, NoteInfo}
import notes.fixtures.NoteFixture
import notes.http.responses.FailureResponse

class NoteRoutesSpec
    extends AsyncFreeSpec
    with AsyncIOSpec
    with Matchers
    with NoteFixture {

  private class StubNotes(
      allResponse: IO[List[Note]] = IO.pure(Nil),
      findResponse: UUID => IO[Option[Note]] = _ => IO.pure(None),
      createResponse: NoteInfo => IO[Note] = info =>
        IO.pure(Note(UUID.randomUUID(), info.title, info.content, note1.createdAt, note1.updatedAt)),
      updateResponse: (UUID, NoteInfo) => IO[Option[Note]] = (_, _) => IO.pure(None),
      deleteResponse: UUID => IO[Int] = _ => IO.pure(0)
  ) extends Notes {
    override def all(): IO[List[Note]] = allResponse
    override def find(id: UUID): IO[Option[Note]] = findResponse(id)
    override def create(noteInfo: NoteInfo): IO[Note] = createResponse(noteInfo)
    override def update(id: UUID, noteInfo: NoteInfo): IO[Option[Note]] = updateResponse(id, noteInfo)
    override def delete(id: UUID): IO[Int] = deleteResponse(id)
  }

  private class StubRateLimiter(allowed: Boolean = true) extends RateLimiter {
    override def isAllowed(key: String, maxRequests: Int, windowSeconds: Int): IO[Boolean] =
      IO.pure(allowed)
  }

  "NoteRoutes" - {
    "GET /notes" - {
      "요청 한도(Rate limit) 내에 있을 때 200 OK와 노트 목록을 반환해야 한다" in {
        val stubNotes = new StubNotes(allResponse = IO.pure(List(note1, note2)))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter(allowed = true)).routes
        val request = Request[IO](Method.GET, uri"/notes")

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[List[Note]]
        } yield {
          response.status shouldBe Status.Ok
          body shouldBe List(note1, note2)
        }
      }

      "요청 한도(Rate limit)를 초과했을 때 429 Too Many Requests를 반환해야 한다" in {
        val stubNotes = new StubNotes(allResponse = IO.pure(List(note1)))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter(allowed = false)).routes
        val request = Request[IO](Method.GET, uri"/notes")

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[JsonResult]
        } yield {
          response.status shouldBe Status.TooManyRequests
          body.message shouldBe "Too many requests, please try again later"
        }
      }
    }

    "POST /notes" - {
      "유효한 노트 정보 전달 시 201 Created와 생성된 노트를 반환해야 한다" in {
        val expectedNote = Note(UUID.randomUUID(), noteInfo1.title, noteInfo1.content, note1.createdAt, note1.updatedAt)
        val stubNotes = new StubNotes(createResponse = _ => IO.pure(expectedNote))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.POST, uri"/notes").withEntity(noteInfo1)

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[Note]
        } yield {
          response.status shouldBe Status.Created
          body shouldBe expectedNote
        }
      }

      "유효하지 않은 요청 본문 전달 시 400 Bad Request를 반환해야 한다" in {
        val stubNotes = new StubNotes()
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val invalidJson = Json.obj("invalid" -> "payload".asJson)
        val request = Request[IO](Method.POST, uri"/notes").withEntity(invalidJson)

        for {
          response <- routes.orNotFound.run(request)
        } yield {
          response.status shouldBe Status.BadRequest
        }
      }
    }

    "GET /notes/:id" - {
      "존재하는 노트 ID 조회의 경우 200 OK와 해당 노트를 반환해야 한다" in {
        val stubNotes = new StubNotes(findResponse = id => if (id == note1.id) IO.pure(Some(note1)) else IO.pure(None))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.GET, Uri.unsafeFromString(s"/notes/${note1.id}"))

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[Note]
        } yield {
          response.status shouldBe Status.Ok
          body shouldBe note1
        }
      }

      "존재하지 않는 노트 ID 조회의 경우 404 Not Found를 반환해야 한다" in {
        val stubNotes = new StubNotes(findResponse = _ => IO.pure(None))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.GET, Uri.unsafeFromString(s"/notes/$nonExistentNoteId"))

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[FailureResponse]
        } yield {
          response.status shouldBe Status.NotFound
          body.error shouldBe s"Note $nonExistentNoteId not found."
        }
      }
    }

    "PUT /notes/:id" - {
      "존재하는 노트를 수정하는 경우 200 OK와 수정된 노트를 반환해야 한다" in {
        val updatedNote = Note(note1.id, updatedNoteInfo.title, updatedNoteInfo.content, note1.createdAt, note1.updatedAt)
        val stubNotes = new StubNotes(updateResponse = (id, _) =>
          if (id == note1.id) IO.pure(Some(updatedNote)) else IO.pure(None)
        )
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.PUT, Uri.unsafeFromString(s"/notes/${note1.id}")).withEntity(updatedNoteInfo)

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[Note]
        } yield {
          response.status shouldBe Status.Ok
          body shouldBe updatedNote
        }
      }

      "존재하지 않는 노트를 수정하는 경우 404 Not Found를 반환해야 한다" in {
        val stubNotes = new StubNotes(updateResponse = (_, _) => IO.pure(None))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.PUT, Uri.unsafeFromString(s"/notes/$nonExistentNoteId")).withEntity(updatedNoteInfo)

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[FailureResponse]
        } yield {
          response.status shouldBe Status.NotFound
          body.error shouldBe s"Cannot update note $nonExistentNoteId: not found"
        }
      }
    }

    "DELETE /notes/:id" - {
      "존재하는 노트를 삭제하는 경우 200 OK와 성공 메시지를 반환해야 한다" in {
        val stubNotes = new StubNotes(deleteResponse = id => if (id == note1.id) IO.pure(1) else IO.pure(0))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.DELETE, Uri.unsafeFromString(s"/notes/${note1.id}"))

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[JsonResult]
        } yield {
          response.status shouldBe Status.Ok
          body.message shouldBe "Note deleted successfully!"
        }
      }

      "존재하지 않는 노트를 삭제하는 경우 404 Not Found를 반환해야 한다" in {
        val stubNotes = new StubNotes(deleteResponse = _ => IO.pure(0))
        val routes = NoteRoutes(stubNotes, new StubRateLimiter()).routes
        val request = Request[IO](Method.DELETE, Uri.unsafeFromString(s"/notes/$nonExistentNoteId"))

        for {
          response <- routes.orNotFound.run(request)
          body <- response.as[FailureResponse]
        } yield {
          response.status shouldBe Status.NotFound
          body.error shouldBe s"Cannot delete note $nonExistentNoteId: not found"
        }
      }
    }
  }
}
