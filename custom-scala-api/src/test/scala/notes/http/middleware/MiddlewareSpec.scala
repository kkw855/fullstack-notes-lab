package notes.http.middleware

import cats.effect.IO
import cats.effect.testing.scalatest.AsyncIOSpec

import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.dsl.Http4sDsl
import org.http4s.implicits.*
import org.scalatest.freespec.AsyncFreeSpec
import org.scalatest.matchers.should.Matchers
import org.typelevel.ci.*
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

import notes.domain.errors.AppError
import notes.http.responses.FailureResponse

class MiddlewareSpec extends AsyncFreeSpec with AsyncIOSpec with Matchers with Http4sDsl[IO] {

  given logger: Logger[IO] = Slf4jLogger.getLogger[IO]

  "CorsHandler" - {
    "OPTIONS 프리플라이트 요청에 적절한 CORS 헤더를 반환해야 한다" in {
      val routes = HttpRoutes.of[IO] { case GET -> Root / "test" =>
        Ok("ok")
      }
      val corsRoutes = CorsHandler(routes)
      val request = Request[IO](Method.OPTIONS, uri"/test", headers = Headers(
        Header.Raw(ci"Origin", "http://localhost:3000"),
        Header.Raw(ci"Access-Control-Request-Method", "GET")
      ))

      for {
        response <- corsRoutes.orNotFound.run(request)
      } yield {
        response.status shouldBe Status.Ok
        response.headers.get(ci"Access-Control-Allow-Origin").map(_.head.value) shouldBe Some("*")
      }
    }
  }

  "GlobalErrorHandler" - {
    "AppError.NotFound 처리 시 404 Not Found 및 FailureResponse를 반환해야 한다" in {
      val routes = HttpRoutes.of[IO] { case GET -> Root / "error" =>
        IO.raiseError(AppError.NotFound("Note not found"))
      }
      val handledRoutes = GlobalErrorHandler(routes)
      val request = Request[IO](Method.GET, uri"/error")

      for {
        response <- handledRoutes.orNotFound.run(request)
        body <- response.as[FailureResponse]
      } yield {
        response.status shouldBe Status.NotFound
        body.error shouldBe "Note not found"
      }
    }

    "AppError.BadRequest 처리 시 400 Bad Request 및 FailureResponse를 반환해야 한다" in {
      val routes = HttpRoutes.of[IO] { case GET -> Root / "error" =>
        IO.raiseError(AppError.BadRequest("Invalid title"))
      }
      val handledRoutes = GlobalErrorHandler(routes)
      val request = Request[IO](Method.GET, uri"/error")

      for {
        response <- handledRoutes.orNotFound.run(request)
        body <- response.as[FailureResponse]
      } yield {
        response.status shouldBe Status.BadRequest
        body.error shouldBe "Invalid title"
      }
    }

    "AppError.Unauthorized 처리 시 401 Unauthorized 및 FailureResponse를 반환해야 한다" in {
      val routes = HttpRoutes.of[IO] { case GET -> Root / "error" =>
        IO.raiseError(AppError.Unauthorized("Token expired"))
      }
      val handledRoutes = GlobalErrorHandler(routes)
      val request = Request[IO](Method.GET, uri"/error")

      for {
        response <- handledRoutes.orNotFound.run(request)
        body <- response.as[FailureResponse]
      } yield {
        response.status shouldBe Status.Unauthorized
        body.error shouldBe "Token expired"
      }
    }

    "예상치 못한 예외(RuntimeException) 발생 시 500 Internal Server Error를 반환해야 한다" in {
      val routes = HttpRoutes.of[IO] { case GET -> Root / "error" =>
        IO.raiseError(new RuntimeException("Database connection timeout"))
      }
      val handledRoutes = GlobalErrorHandler(routes)
      val request = Request[IO](Method.GET, uri"/error")

      for {
        response <- handledRoutes.orNotFound.run(request)
        body <- response.as[FailureResponse]
      } yield {
        response.status shouldBe Status.InternalServerError
        body.error shouldBe "Internal server error: Database connection timeout"
      }
    }
  }
}
