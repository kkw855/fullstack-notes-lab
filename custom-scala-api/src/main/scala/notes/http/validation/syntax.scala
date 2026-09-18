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
          .attemptAs[A]
          .value.flatMap {
            case Left(decodeFailure) => BadRequest(FailureResponse(s"Invalid JSON payload: ${decodeFailure.getMessage}"))
            case Right(entity) => validateEntity(entity) match {
              case Valid(valid) => serverLogicIfValid(valid) // 여기서 난 에러는 GlobalErrorHandler
              case Invalid(errors) => BadRequest(FailureResponse(errors.toList.map(_.errorMessage).mkString(", ")))
            }
          }
    }
  }
}
