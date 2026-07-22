package notes.note

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface NoteJpaRepository : JpaRepository<NoteEntity, UUID>
