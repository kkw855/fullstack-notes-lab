package notes.core

import cats.effect.IO
import cats.effect.testing.scalatest.AsyncIOSpec

import org.scalatest.OptionValues
import org.scalatest.freespec.AsyncFreeSpec
import org.scalatest.matchers.should.Matchers

import scala.concurrent.duration.*

import notes.fixtures.NoteFixture

class NotesSpec
    extends AsyncFreeSpec
    with AsyncIOSpec
    with Matchers
    with OptionValues
    with DoobieSpec
    with NoteFixture {

  private def withNotes[A](test: Notes => IO[A]): IO[A] =
    withTransactor { xa =>
      for {
        liveNotes <- LiveNotes(xa)
        result <- test(liveNotes)
      } yield result
    }

  "LiveNotes" - {
    "새로운 노트를 생성하고 생성된 ID로 조회가 가능해야 한다" in withNotes { notes =>
      for {
        created <- notes.create(noteInfo1)
        found <- notes.find(created.id)
      } yield {
        created.title shouldBe noteInfo1.title
        created.content shouldBe noteInfo1.content
        found shouldBe Some(created)
      }
    }

    "존재하지 않는 노트 ID로 조회 시 None을 반환해야 한다" in withNotes { notes =>
      for {
        found <- notes.find(nonExistentNoteId)
      } yield {
        found shouldBe None
      }
    }

    "모든 노트를 작성일시(created_at) 내림차순으로 조회해야 한다" in withNotes { notes =>
      for {
        n1 <- notes.create(noteInfo2)
        _ <- IO.sleep(100.milliseconds)
        n2 <- notes.create(noteInfo3)
        all <- notes.all()
      } yield {
        val ids = all.map(_.id)
        ids.indexOf(n2.id) should be < ids.indexOf(n1.id)
      }
    }

    "존재하는 노트를 수정하고 수정된 정보를 반환해야 한다" in withNotes { notes =>
      for {
        created <- notes.create(initialNoteInfo)
        updated <- notes.update(created.id, updatedNoteInfo)
        found <- notes.find(created.id)
      } yield {
        updated.value.title shouldBe updatedNoteInfo.title
        updated.value.content shouldBe updatedNoteInfo.content
        found shouldBe updated
      }
    }

    "존재하지 않는 노트를 수정하려고 하면 None을 반환해야 한다" in withNotes { notes =>
      for {
        updated <- notes.update(nonExistentNoteId, updatedNoteInfo)
      } yield {
        updated shouldBe None
      }
    }

    "존재하는 노트를 삭제하고 삭제된 건수(1)를 반환해야 한다" in withNotes { notes =>
      for {
        created <- notes.create(noteInfoToDelete)
        deleteCount <- notes.delete(created.id)
        found <- notes.find(created.id)
      } yield {
        deleteCount shouldBe 1
        found shouldBe None
      }
    }

    "존재하지 않는 노트를 삭제하려고 하면 0을 반환해야 한다" in withNotes { notes =>
      for {
        deleteCount <- notes.delete(nonExistentNoteId)
      } yield {
        deleteCount shouldBe 0
      }
    }
  }
}
