package notes.http.routes

import cats.data.*
import cats.effect.*
import cats.implicits.*

import io.circe.Codec

import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.server.*

import notes.core.{Notes, RateLimiter}
import notes.domain.note.NoteInfo
import notes.http.responses.FailureResponse
import notes.http.validation.syntax.*

final case class JsonResult(message: String) derives Codec.AsObject

class NoteRoutes private (notes: Notes, rateLimiter: RateLimiter) extends HttpValidationDsl {
  private val allNotesRoute: HttpRoutes[IO] = HttpRoutes.of[IO] { case GET -> Root =>
    rateLimiter.isAllowed("rate:my-rate-limit", maxRequests = 10, windowSeconds = 20).flatMap {
      case true  => notes.all().flatMap(Ok(_))
      case false => TooManyRequests(JsonResult("Too many requests, please try again later"))
    }
  }

  private val createNoteRoute = HttpRoutes.of[IO] { case req @ POST -> Root =>
    req.validate[NoteInfo] { noteInfo =>
      for {
        savedNote <- notes.create(noteInfo)
        resp <- Created(savedNote)
      } yield resp
    }
  }

  private val findNoteRoute: HttpRoutes[IO] = HttpRoutes.of[IO] { case GET -> Root / UUIDVar(id) =>
    notes.find(id).flatMap {
      case Some(note) => Ok(note)
      case None       => NotFound(FailureResponse(s"Note $id not found."))
    }
  }

  private val updateNoteRoute = HttpRoutes.of[IO] { case req @ PUT -> Root / UUIDVar(id) =>
    req.validate[NoteInfo] { noteInfo =>
      for {
        maybeNote <- notes.update(id, noteInfo)
        resp <- maybeNote match {
          case Some(updatedNote) => Ok(updatedNote)
          case None              => NotFound(FailureResponse(s"Cannot update note $id: not found"))
        }
      } yield resp
    }
  }

  private val deleteNoteRoute = HttpRoutes.of[IO] { case DELETE -> Root / UUIDVar(id) =>
    notes.delete(id).flatMap {
      case count if count > 0 => Ok(JsonResult("Note deleted successfully!"))
      case _                  => NotFound(FailureResponse(s"Cannot delete note $id: not found"))
    }
  }

  val routes: HttpRoutes[IO] = Router(
    "/notes" -> (allNotesRoute <+> findNoteRoute <+> createNoteRoute <+> updateNoteRoute <+> deleteNoteRoute)
  )
}

object NoteRoutes {
  def apply(notes: Notes, rateLimiter: RateLimiter): NoteRoutes = new NoteRoutes(notes, rateLimiter)
}
