package notes.http.validation

import cats.*
import cats.data.Validated.*
import cats.effect.IO

import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.dsl.Http4sDsl

import validators.*

import notes.http.responses.FailureResponse

object syntax {

  private def validateEntity[A](entity: A)(using validator: Validator[A]): ValidationResult[A] =
    validator.validate(entity)

  trait HttpValidationDsl extends Http4sDsl[IO] {

    extension (req: Request[IO]) {
      def validate[A: Validator](serverLogicIfValid: A => IO[Response[IO]])(using
          EntityDecoder[IO, A]
      ): IO[Response[IO]] =
        req
          .as[A]
          // .logError(e => s"Parsing payload failed: $e")
          .map(validateEntity) // IO[ValidationResult[A]]
          .flatMap {
            case Valid(entity) =>
              serverLogicIfValid(entity) // IO[Response[IO]]
            case Invalid(errors) =>
              BadRequest(FailureResponse(errors.toList.map(_.errorMessage).mkString(", ")))
          }
          .handleErrorWith {
            case err: org.http4s.MessageBodyFailure =>
              BadRequest(FailureResponse(s"Invalid JSON payload: ${err.getMessage}"))
            case err =>
              InternalServerError(FailureResponse(s"Unexpected server error: ${err.getMessage}"))
          }
    }
  }
}
