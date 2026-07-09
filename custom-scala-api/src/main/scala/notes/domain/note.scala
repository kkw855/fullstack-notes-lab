package notes.domain

import io.circe.Codec

import java.time.OffsetDateTime
import java.util.UUID

object note {
  case class Note(
      id: UUID,
      title: String,
      content: String,
      createdAt: OffsetDateTime,
      updatedAt: OffsetDateTime
  ) derives Codec.AsObject

  case class NoteInfo(title: String, content: String) derives Codec.AsObject
}
