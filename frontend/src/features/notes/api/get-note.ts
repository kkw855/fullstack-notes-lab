import { queryOptions } from '@tanstack/react-query'

import { api } from '#/lib/api-client'
import type { Note } from '#/types/api'

export const getNote = async ({
  noteId,
}: {
  noteId: string
}): Promise<Note> => {
  const response = await api.get(`/notes/${noteId}`)
  return response.data
}

export const getNoteQueryOptions = (noteId: string) => {
  return queryOptions({
    queryKey: ['notes', noteId],
    queryFn: () => getNote({ noteId }),
  })
}
