package notes.modules

import cats.effect.{IO, Resource}

import doobie.hikari.HikariTransactor

import notes.core.{LiveNotes, Notes}

class Core private (val notes: Notes) {}

object Core {
  def apply(xa: HikariTransactor[IO]): Resource[IO, Core] = {
    val coreIO = for {
      liveNotes <- LiveNotes(xa)
    } yield new Core(liveNotes)

    Resource.eval(coreIO)
  }
}
