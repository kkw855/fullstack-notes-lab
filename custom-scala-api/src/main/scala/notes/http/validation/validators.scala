package notes.http.validation

import cats.data.*
import cats.data.Validated.*
import cats.implicits.*
import notes.domain.note.*
import notes.domain.user.*
import org.apache.commons.validator.routines.EmailValidator

object validators {
  sealed trait ValidationFailure(val errorMessage: String)

  type ValidationResult[A] = ValidatedNel[ValidationFailure, A]

  trait Validator[A] {
    def validate(value: A): ValidationResult[A]
  }

  private final case class EmptyField(fieldName: String)
    extends ValidationFailure(s"'$fieldName' is empty")

  private final case class InvalidEmail(fieldName: String) extends ValidationFailure(s"'$fieldName' is not a valid email")

  private final case class TooShort(fieldName: String, min: Int) extends ValidationFailure(s"'$fieldName must be at least $min characters")

  private val emailValidator = EmailValidator.getInstance()

  private def validateRequired[A](field: A, fieldName: String)(
      required: A => Boolean
  ): ValidationResult[A] =
    if (required(field)) field.validNel
    else EmptyField(fieldName).invalidNel

  private def check[A](field: A, failure: => ValidationFailure)(ok: A => Boolean): ValidationResult[A] =
    if (ok(field)) field.validNel else failure.invalidNel

  given newNoteInfoValidator: Validator[NoteInfo] = newNoteInfo => {
    (
      validateRequired(newNoteInfo.title, "title")(_.trim.nonEmpty),
      validateRequired(newNoteInfo.content, "content")(_.trim.nonEmpty)
    ).mapN(NoteInfo.apply)
  }

  given credentialsValidator: Validator[Credentials] = credentials => {
    val email = credentials.email.trim.toLowerCase
    (
      check(email, InvalidEmail("email")) { email =>
        email.length <= 255 && emailValidator.isValid(email)
      },
      check(credentials.password, TooShort("password", 8))(_.length >= 8)
    ).mapN(Credentials.apply)
  }
}