import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getNotesQueryOptions } from '#/features/notes/api/get-notes'
import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/react-query'

export const deleteNote = ({ noteId }: { noteId: string }) => {
  return api.delete(`/notes/${noteId}`)
}

type UseDeleteNoteOptions = {
  mutationConfig?: MutationConfig<typeof deleteNote>
}

export const useDeleteNote = ({
  mutationConfig,
}: UseDeleteNoteOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: getNotesQueryOptions().queryKey,
      })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: deleteNote,
  })
}
