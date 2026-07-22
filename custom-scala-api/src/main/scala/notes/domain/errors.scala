package notes.domain

import scala.util.control.NoStackTrace

object errors {
  sealed trait AppError extends Throwable with NoStackTrace {
    def message: String
  }

  object AppError {
    final case class NotFound(message: String) extends AppError
    final case class BadRequest(message: String) extends AppError
    final case class Unauthorized(message: String) extends AppError
    final case class Forbidden(message: String) extends AppError
    final case class Conflict(message: String) extends AppError
    final case class TooManyRequests(message: String) extends AppError
    final case class InternalError(message: String) extends AppError
  }
}
