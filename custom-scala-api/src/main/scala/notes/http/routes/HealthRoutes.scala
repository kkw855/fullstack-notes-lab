package notes.http.routes

import cats.effect.IO

import org.http4s.*
import org.http4s.dsl.*
import org.http4s.server.*

class HealthRoutes private extends Http4sDsl[IO] {
  private val healthRoute: HttpRoutes[IO] = HttpRoutes.of[IO] { case GET -> Root =>
    Ok("All going great!")
  }

  val routes: HttpRoutes[IO] = Router(
    "/health" -> healthRoute
  )
}

object HealthRoutes {
  def apply = new HealthRoutes
}
