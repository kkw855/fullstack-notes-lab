package notes.http.routes

import cats.effect.*
import cats.implicits.*
import io.circe.Codec
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.dsl.io.*
import org.http4s.server.*
import notes.core.Notes
import notes.domain.note.NoteInfo

final case class JsonResult(message: String) derives Codec.AsObject

class NoteRoutes private (notes: Notes) {
  private val allNotesRoute: HttpRoutes[IO] = HttpRoutes.of[IO] { case GET -> Root =>
    notes.all().flatMap(Ok(_))
  }

  private val createNoteRoute = HttpRoutes.of[IO] { case req @ POST -> Root =>
    for {
      noteInfo <- req.as[NoteInfo]
      id <- notes.create(noteInfo)
      resp <- Created(JsonResult("Note created successfully!")) 
    } yield resp
  }

  private val updateNoteRoute = HttpRoutes.of[IO] { case PUT -> Root / id =>
    Ok(JsonResult("Note updated successfully!"))
  }

  private val deleteNoteRoute = HttpRoutes.of[IO] { case DELETE -> Root / id =>
    Ok(JsonResult("Note deleted successfully!"))
  }

  val routes: HttpRoutes[IO] = Router(
    "/notes" -> (allNotesRoute <+> createNoteRoute <+> updateNoteRoute <+> deleteNoteRoute)
  )
}

object NoteRoutes {
  def apply(notes: Notes): NoteRoutes = new NoteRoutes(notes)
}
