import { Option, pipe } from 'effect'
import { type TextareaHTMLAttributes, useLayoutEffect, useRef } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
type AutoResizeTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  registration: UseFormRegisterReturn
}

export const AutoResizeTextArea = ({
  registration,
  className,
  ...props
}: AutoResizeTextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = (element: HTMLTextAreaElement) => {
    element.style.height = '0px'
    element.style.height = `${element.scrollHeight}px`
  }

  useLayoutEffect(() => {
    pipe(
      textareaRef.current,
      Option.fromNullable,
      Option.match({
        onNone: () => {},
        onSome: resize,
      }),
    )
  }, [])

  return (
    <textarea
      {...registration}
      {...props}
      ref={(element) => {
        textareaRef.current = element

        // React Hook Form에도 실제 DOM을 연결
        registration.ref(element)
      }}
      className={`resize-none overflow-hidden ${className ?? ''}`}
      rows={1}
      onInput={(event) => {
        resize(event.currentTarget)
        props.onInput?.(event)
      }}
    />
  )
}
