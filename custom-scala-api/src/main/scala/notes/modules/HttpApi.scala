package notes.modules

import cats.effect.*
import cats.implicits.*

import org.http4s.*
import org.http4s.server.*
import org.http4s.server.middleware.{CORS, ErrorHandling}

import notes.http.routes.{HealthRoutes, NoteRoutes}

class HttpApi private (core: Core) {
  private val healthRoutes = HealthRoutes.apply.routes
  private val noteRoutes = NoteRoutes(core.notes, core.rateLimiter).routes

  // CORS 기본 정책 및 글로벌 예외 복구 탑재
  val endPoints: HttpRoutes[IO] = ErrorHandling.Recover.total(
    CORS.policy.withAllowOriginAll(
      Router(
        "/api" -> (healthRoutes <+> noteRoutes)
      )
    )
  )
}

object HttpApi {
  def apply(core: Core): Resource[IO, HttpApi] = Resource.pure(new HttpApi(core))
}
