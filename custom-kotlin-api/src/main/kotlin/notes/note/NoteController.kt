package notes.note

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity
import java.util.UUID

@RestController
@RequestMapping("/api/notes")
class NoteController(private val noteService: NoteService) {

    @PostMapping
    fun createNote(@RequestBody request: CreateNoteRequest): ResponseEntity<NoteResponse> {
        val response = noteService.createNote(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping
    fun getAllNotes(): ResponseEntity<List<NoteResponse>> {
        return ResponseEntity.ok(noteService.getAllNotes())
    }

    @GetMapping("/{id}")
    fun getNote(@PathVariable id: UUID): ResponseEntity<NoteResponse> {
        return ResponseEntity.ok(noteService.getNote(id))
    }

    @PutMapping("/{id}")
    fun updateNote(
        @PathVariable id: UUID,
        @RequestBody request: UpdateNoteRequest
    ): ResponseEntity<NoteResponse> {
        return ResponseEntity.ok(noteService.updateNote(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteNote(@PathVariable id: UUID): ResponseEntity<Unit> {
        noteService.deleteNote(id)
        return ResponseEntity.noContent().build()
    }
}
