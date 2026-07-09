// noinspection SqlNoDataSourceInspection, SqlResolve"
package notes.core

import cats.effect.IO

import doobie.Transactor
import doobie.implicits.*
import doobie.postgres.implicits.* // Postgres uuid ↔ java.util.UUID 매핑

import java.util.UUID

import notes.domain.note.*

trait Notes {
  def all(): IO[List[Note]]
  def create(noteInfo: NoteInfo): IO[UUID]
}

class LiveNotes private (xa: Transactor[IO]) extends Notes {

  override def all(): IO[List[Note]] =
    sql"""
      SELECT
        id,
        title,
        content,
        created_at,
        updated_at
      FROM notes
    """
      .query[Note]
      .to[List]
      .transact(xa)

  override def create(noteInfo: NoteInfo): IO[UUID] =
    sql"""
      INSERT INTO notes(
        title,
        content
      ) VALUES(
        ${noteInfo.title},
        ${noteInfo.content}
      )
    """.update
      .withUniqueGeneratedKeys[UUID]("id")
      .transact(xa)
}

object LiveNotes {
  def apply(xa: Transactor[IO]): IO[LiveNotes] = IO(new LiveNotes(xa))
}
