package notes.note

import org.springframework.transaction.annotation.Transactional
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.UUID

@Service
@Transactional(readOnly = true)
class NoteService(
    private val noteJpaRepository: NoteJpaRepository,
    private val noteJooqRepository: NoteJooqRepository
) {
    // C (Create): JPA 사용
    @Transactional
    fun createNote(request: CreateNoteRequest): NoteResponse {
        val entity = NoteEntity(
            title = request.title,
            content = request.content
        )
        val saved = noteJpaRepository.save(entity)
        return saved.toResponse()
    }

    // R (Read - List): jOOQ 사용
    fun getAllNotes(): List<NoteResponse> {
        return noteJooqRepository.findAll()
    }

    // R (Read - Single): jOOQ 사용
    fun getNote(id: UUID): NoteResponse {
        return noteJooqRepository.findById(id)
            ?: throw NoSuchElementException("노트를 찾을 수 없습니다: $id")
    }

    // U (Update): JPA 사용 (Dirty Checking)
    @Transactional
    fun updateNote(id: UUID, request: UpdateNoteRequest): NoteResponse {
        val entity = noteJpaRepository.findById(id)
            .orElseThrow { NoSuchElementException("노트를 찾을 수 없습니다: $id") }

        entity.title = request.title
        entity.content = request.content
        entity.updatedAt = OffsetDateTime.now()

        return entity.toResponse()
    }

    // D (Delete): JPA 사용
    @Transactional
    fun deleteNote(id: UUID) {
        if (!noteJpaRepository.existsById(id)) {
            throw NoSuchElementException("노트를 찾을 수 없습니다: $id")
        }
        noteJpaRepository.deleteById(id)
    }
}

// 🌟 코틀린 스타일: Note -> NoteResponse 변환용 확장 함수
fun NoteEntity.toResponse(): NoteResponse = NoteResponse(
    id = this.id!!,
    title = this.title,
    content = this.content,
    createdAt = this.createdAt ?: OffsetDateTime.now(), // 🌟 null이면 현재
    updatedAt = this.updatedAt ?: OffsetDateTime.now(), // 🌟 null이면 현재
)
