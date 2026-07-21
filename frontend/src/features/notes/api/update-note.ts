import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { getNotesQueryOptions } from '#/features/notes/api/get-notes'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Note } from '#/types/api'

export const updateNoteInputSchema = z.object({
  title: z.string().trim().min(1, 'Required'),
  content: z.string().trim().min(1, 'Required'),
})

export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>

export const updateNote = async ({
  data,
  noteId,
}: {
  data: UpdateNoteInput
  noteId: string
}): Promise<Note> => {
  const response = await api.put(`/notes/${noteId}`, data)
  return response.data
}

type UseUpdateNoteOptions = {
  noteId: string
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
