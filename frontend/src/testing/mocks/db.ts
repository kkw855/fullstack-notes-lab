import type { Note } from '#/types/api'

let notes: Note[] = []
let nextId = 1

const now = () => new Date().toISOString()

export const notesDb = {
  reset(seed: Array<Pick<Note, 'title' | 'content'>> = []) {
    nextId = 1
    notes = seed.map((note) => this.create(note))
  },
  list(): Note[] {
    return notes
  },
  find(id: string): Note | undefined {
    return notes.find((note) => note.id === id)
  },
  create(input: { title: string; content: string }): Note {
    const note: Note = {
      id: String(nextId++),
      title: input.title,
      content: input.content,
      createdAt: now(),
      updatedAt: now(),
    }
    notes.push(note)
    return note
  },
  update(
    id: string,
    input: { title: string; content: string },
  ): Note | undefined {
    const note = notes.find((n) => n.id === id)
    if (!note) return undefined
    note.title = input.title
    note.content = input.content
    note.updatedAt = now()
    return note
  },
  remove(id: string): boolean {
    const index = notes.findIndex((n) => n.id === id)
    if (index === -1) return false
    notes.splice(index, 1)
    return true
  },
}
