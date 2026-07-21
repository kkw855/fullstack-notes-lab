import { useQuery, queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import type { QueryConfig } from '@/lib/react-query'
import type { Note } from '@/types/api'

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

type UseNoteOptions = {
  noteId: string
  queryConfig?: QueryConfig<typeof getNoteQueryOptions>
}

export const useNote = ({ noteId, queryConfig }: UseNoteOptions) => {
  return useQuery({
    ...getNoteQueryOptions(noteId),
    ...queryConfig,
  })
}
