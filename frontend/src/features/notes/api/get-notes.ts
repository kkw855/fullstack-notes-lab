import { queryOptions, useQuery } from '@tanstack/react-query'

import type { Note } from '#/types/api'
import { api } from '@/lib/api-client'
import type { QueryConfig } from '@/lib/react-query'

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get(`/notes`)
  return response.data
}

export const getNotesQueryOptions = () => {
  return queryOptions({
    // queryKey: page ? ['discussions', { page }] : ['discussions'],
    queryKey: ['notes'],
    queryFn: () => getNotes(),
  })
}

type UseNotesOptions = {
  queryConfig?: QueryConfig<typeof getNotesQueryOptions>
}

export const useNotes = ({ queryConfig }: UseNotesOptions = {}) => {
  return useQuery({
    ...getNotesQueryOptions(),
    ...queryConfig,
  })
}
