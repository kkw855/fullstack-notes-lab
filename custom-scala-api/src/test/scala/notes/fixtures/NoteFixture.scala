package notes.fixtures

import java.time.OffsetDateTime
import java.util.UUID

import notes.domain.note.{Note, NoteInfo}

trait NoteFixture {
  val noteInfo1: NoteInfo = NoteInfo(title = "First Note", content = "Hello World")
  val noteInfo2: NoteInfo = NoteInfo(title = "Note 1", content = "Content 1")
  val noteInfo3: NoteInfo = NoteInfo(title = "Note 2", content = "Content 2")
  val initialNoteInfo: NoteInfo = NoteInfo(title = "Original Title", content = "Original Content")
  val updatedNoteInfo: NoteInfo = NoteInfo(title = "Updated Title", content = "Updated Content")
  val noteInfoToDelete: NoteInfo = NoteInfo(title = "To be deleted", content = "Goodbye")
  val nonExistentNoteId: UUID = UUID.fromString("00000000-0000-0000-0000-000000000000")

  val note1: Note = Note(
    id = UUID.fromString("11111111-1111-1111-1111-111111111111"),
    title = "First Note",
    content = "Hello World",
    createdAt = OffsetDateTime.parse("2026-07-21T00:00:00Z"),
    updatedAt = OffsetDateTime.parse("2026-07-21T00:00:00Z")
  )

  val note2: Note = Note(
    id = UUID.fromString("22222222-2222-2222-2222-222222222222"),
    title = "Second Note",
    content = "Another Content",
    createdAt = OffsetDateTime.parse("2026-07-21T01:00:00Z"),
    updatedAt = OffsetDateTime.parse("2026-07-21T01:00:00Z")
  )
}

object NoteFixture extends NoteFixture
