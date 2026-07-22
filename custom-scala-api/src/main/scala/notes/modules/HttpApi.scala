package notes.modules

import cats.effect.*
import cats.implicits.*

import org.typelevel.log4cats.Logger

import org.http4s.*
import org.http4s.server.*

import notes.http.middleware.{CorsHandler, GlobalErrorHandler}
import notes.http.routes.{HealthRoutes, NoteRoutes}

class HttpApi private (core: Core)(using logger: Logger[IO]) {
  private val healthRoutes = HealthRoutes.apply.routes
  private val noteRoutes = NoteRoutes(core.notes, core.rateLimiter).routes

  private val apiRoutes: HttpRoutes[IO] = Router(
    "/api" -> (healthRoutes <+> noteRoutes)
  )

  // CORS 및 Global Error Handling 미들웨어 적용
  val endPoints: HttpRoutes[IO] = CorsHandler(
    GlobalErrorHandler(apiRoutes)
  )
}

object HttpApi {
  def apply(core: Core)(using logger: Logger[IO]): Resource[IO, HttpApi] =
    Resource.pure(new HttpApi(core))
}
