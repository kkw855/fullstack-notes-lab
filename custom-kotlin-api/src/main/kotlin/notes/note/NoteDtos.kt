package notes.note

import java.time.OffsetDateTime
import java.util.UUID

data class CreateNoteRequest(val title: String, val content: String)

data class UpdateNoteRequest(val title: String, val content: String)

data class NoteResponse(
    val id: UUID,
    val title: String,
    val content: String,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)
