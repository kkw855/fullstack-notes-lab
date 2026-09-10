import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateNoteInput } from '#/features/notes/api/create-note'
import { getNotesQueryOptions } from '#/features/notes/api/get-notes'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Note } from '#/types/api'

export const updateNote = async ({
  noteId,
  data,
}: {
  noteId: string
  data: CreateNoteInput
}): Promise<Note> => {
  const response = await api.put(`/notes/${noteId}`, data)
  return response.data
}

type UseUpdateNoteOptions = {
  mutationConfig?: MutationConfig<typeof updateNote>
}

export const useUpdateNote = ({ mutationConfig }: UseUpdateNoteOptions) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // 🌟 여기서 data는 서버 응답값(Note)입니다!
    onSuccess: async (data, ...args) => {
      await queryClient.invalidateQueries({
        queryKey: getNotesQueryOptions().queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updateNote,
  })
}
