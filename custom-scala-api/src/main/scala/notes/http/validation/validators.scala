package notes.http.validation

import cats.data.*
import cats.data.Validated.*
import cats.implicits.* // validNel, invalidNel, mapN

import notes.domain.note.*

object validators {
  sealed trait ValidationFailure(val errorMessage: String)

  private case class EmptyField(fieldName: String)
      extends ValidationFailure(s"'$fieldName' is empty")

  type ValidationResult[A] = ValidatedNel[ValidationFailure, A]

  trait Validator[A] {
    def validate(value: A): ValidationResult[A]
  }

  private def validateRequired[A](field: A, fieldName: String)(
      required: A => Boolean
  ): ValidationResult[A] =
    if (required(field)) field.validNel
    else EmptyField(fieldName).invalidNel

  given newNoteInfoValidator: Validator[NoteInfo] = newNoteInfo => {
    (
      validateRequired(newNoteInfo.title, "title")(_.trim.nonEmpty),
      validateRequired(newNoteInfo.content, "content")(_.trim.nonEmpty)
    ).mapN(NoteInfo.apply)
  }
}
