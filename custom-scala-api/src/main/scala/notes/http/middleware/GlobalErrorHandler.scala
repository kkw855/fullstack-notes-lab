package notes.http.middleware

import cats.data.Kleisli
import cats.data.OptionT
import cats.effect.IO
import cats.implicits.*

import org.typelevel.log4cats.Logger

import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.dsl.Http4sDsl

import notes.domain.errors.AppError
import notes.http.responses.FailureResponse

object GlobalErrorHandler extends Http4sDsl[IO] {

  def apply(routes: HttpRoutes[IO])(using logger: Logger[IO]): HttpRoutes[IO] = Kleisli { req =>
    OptionT {
      routes.run(req).value.handleErrorWith {
        case err: AppError.NotFound =>
          logger.warn(s"Resource not found [${req.method} ${req.uri.path}]: ${err.message}") *>
            NotFound(FailureResponse(err.message)).map(Some(_))

        case err: AppError.BadRequest =>
          logger.warn(s"Bad request [${req.method} ${req.uri.path}]: ${err.message}") *>
            BadRequest(FailureResponse(err.message)).map(Some(_))

        case err: AppError.Unauthorized =>
          logger.warn(s"Unauthorized [${req.method} ${req.uri.path}]: ${err.message}") *>
            Response[IO](Status.Unauthorized)
              .withEntity(FailureResponse(err.message))
              .pure[IO]
              .map(Some(_))

        case err: AppError.Forbidden =>
          logger.warn(s"Forbidden [${req.method} ${req.uri.path}]: ${err.message}") *>
            Forbidden(FailureResponse(err.message)).map(Some(_))

        case err: AppError.Conflict =>
          logger.warn(s"Conflict [${req.method} ${req.uri.path}]: ${err.message}") *>
            Conflict(FailureResponse(err.message)).map(Some(_))

        case err: AppError.TooManyRequests =>
          logger.warn(s"Too many requests [${req.method} ${req.uri.path}]: ${err.message}") *>
            TooManyRequests(FailureResponse(err.message)).map(Some(_))

        case err: AppError.InternalError =>
          logger.error(s"Internal error [${req.method} ${req.uri.path}]: ${err.message}") *>
            InternalServerError(FailureResponse(err.message)).map(Some(_))

        case err: org.http4s.InvalidMessageBodyFailure =>
          logger.warn(s"Invalid message body [${req.method} ${req.uri.path}]: ${err.getMessage}") *>
            BadRequest(FailureResponse(s"Invalid JSON payload: ${err.getMessage}")).map(Some(_))

        case err: org.http4s.MessageBodyFailure =>
          logger.warn(s"Message body failure [${req.method} ${req.uri.path}]: ${err.getMessage}") *>
            BadRequest(FailureResponse(s"Malformed request body: ${err.getMessage}")).map(Some(_))

        case err =>
          logger.error(err)(
            s"Unhandled exception during [${req.method} ${req.uri.path}]: ${err.getMessage}"
          ) *>
            InternalServerError(FailureResponse(s"Internal server error: ${err.getMessage}"))
              .map(Some(_))
      }
    }
  }
}
