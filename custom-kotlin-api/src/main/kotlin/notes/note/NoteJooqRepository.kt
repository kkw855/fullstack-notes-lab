package notes.note

import org.jooq.DSLContext
import org.jooq.impl.DSL.field
import org.jooq.impl.DSL.table
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class NoteJooqRepository (private val dsl: DSLContext){
    private val notesTable = table("notes")
    private val idField = field("id", UUID::class.java)
    private val titleField = field("title", String::class.java)
    private val contentField = field("content", String::class.java)
    private val createdAtField = field("created_at", OffsetDateTime::class.java)
    private val updatedAtField = field("updated_at", OffsetDateTime::class.java)

    // jOOQ를 이용한 전체 목록 조회 (생성일 내림차순)
    fun findAll(): List<NoteResponse> {
        return dsl.select(idField, titleField, contentField, createdAtField, updatedAtField)
            .from(notesTable)
            .orderBy(createdAtField.desc())
            .fetch { record ->
                NoteResponse(
                    id = record.get(idField)!!,
                    title = record.get(titleField)!!,
                    content = record.get(contentField)!!,
                    createdAt = record.get(createdAtField)!!,
                    updatedAt = record.get(updatedAtField)!!
                )
            }
    }

    // jOOQ를 이용한 단건 조회
    fun findById(id: UUID): NoteResponse? {
        return dsl.select(idField, titleField, contentField, createdAtField, updatedAtField)
            .from(notesTable)
            .where(idField.eq(id))
            .fetchOne { record ->
                NoteResponse(
                    id = record.get(idField)!!,
                    title = record.get(titleField)!!,
                    content = record.get(contentField)!!,
                    createdAt = record.get(createdAtField)!!,
                    updatedAt = record.get(updatedAtField)!!
                )
            }
    }
}
