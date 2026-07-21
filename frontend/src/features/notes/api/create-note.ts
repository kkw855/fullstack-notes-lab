import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { getNotesQueryOptions } from '#/features/notes/api/get-notes'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Note } from '#/types/api'

export const createNoteInputSchema = z.object({
  title: z.string().trim().min(1, 'Required'),
  content: z.string().trim().min(1, 'Required'),
})

export type CreateNoteInput = z.infer<typeof createNoteInputSchema>

export const createNote = ({
  data,
}: {
  data: CreateNoteInput
}): Promise<Note> => {
  return api.post('/notes', data)
}

type UseCreateNoteOptions = {
  mutationConfig?: MutationConfig<typeof createNote>
}

export const useCreateNote = ({ mutationConfig }: UseCreateNoteOptions) => {
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
    mutationFn: createNote,
  })
}
