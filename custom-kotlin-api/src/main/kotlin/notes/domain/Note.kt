package notes.domain

import java.time.OffsetDateTime
import java.util.UUID

data class Note(
    val id: UUID,
    val title: String,
    val content: String,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)
