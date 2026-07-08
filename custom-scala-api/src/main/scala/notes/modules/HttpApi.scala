package notes.modules

import cats.effect.*
import cats.implicits.*

import io.circe.Codec

import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.dsl.io.*
import org.http4s.server.*

final case class JsonResult(message: String) derives Codec.AsObject

class HttpApi private () {
  private val allNotesRoute: HttpRoutes[IO] = HttpRoutes.of[IO] { case GET -> Root =>
    Ok("you got 20 notes")
  }

  private val createNoteRoute = HttpRoutes.of[IO] { case POST -> Root =>
    Created(JsonResult("Note created successfully!"))
  }

  private val updateNoteRoute = HttpRoutes.of[IO] { case PUT -> Root / id =>
    Ok(JsonResult("Note updated successfully!"))
  }

  private val deleteNoteRoute = HttpRoutes.of[IO] { case DELETE -> Root / id =>
    Ok(JsonResult("Note deleted successfully!"))
  }

  val endPoints: HttpRoutes[IO] = Router(
    "/api/notes" -> (allNotesRoute <+> createNoteRoute <+> updateNoteRoute <+> deleteNoteRoute)
  )
}

object HttpApi {
  def apply(): HttpApi = new HttpApi
}
