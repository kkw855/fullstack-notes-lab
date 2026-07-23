import { HttpResponse, http } from 'msw'

import { notesDb } from '#/testing/mocks/db'

export const handlers = [
  http.get('/api/notes', () => {
    return HttpResponse.json(notesDb.list())
  }),

  http.get('/api/notes/:id', ({ params }) => {
    const note = notesDb.find(params.id as string)
    if (!note) {
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 })
    }
    return HttpResponse.json(note)
  }),

  http.post('/api/notes', async ({ request }) => {
    const body = (await request.json()) as { title: string; content: string }
    return HttpResponse.json(notesDb.create(body), { status: 201 })
  }),

  http.put('/api/notes/:id', async ({ params, request }) => {
    const body = (await request.json()) as { title: string; content: string }
    const note = notesDb.update(params.id as string, body)
    if (!note) {
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 })
    }
    return HttpResponse.json(note)
  }),

  http.delete('/api/notes/:id', ({ params }) => {
    const removed = notesDb.remove(params.id as string)
    if (!removed) {
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
