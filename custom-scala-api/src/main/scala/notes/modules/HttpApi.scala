package notes.modules

import cats.effect.*

import io.circe.Codec

import org.http4s.*
import org.http4s.server.*

import notes.http.routes.NoteRoutes

final case class JsonResult(message: String) derives Codec.AsObject

class HttpApi private (core: Core) {
  private val noteRoutes = NoteRoutes(core.notes).routes

  val endPoints: HttpRoutes[IO] = Router(
    "/api" -> noteRoutes
  )
}

object HttpApi {
  def apply(core: Core): Resource[IO, HttpApi] = Resource.pure(new HttpApi(core))
}
