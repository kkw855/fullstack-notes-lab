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
  def find(id: UUID): IO[Option[Note]]
  def create(noteInfo: NoteInfo): IO[Note]
  def update(id: UUID, noteInfo: NoteInfo): IO[Option[Note]]
  def delete(id: UUID): IO[Int]
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
      ORDER BY created_at DESC
    """
      .query[Note]
      .to[List]
      .transact(xa)

  override def find(id: UUID): IO[Option[Note]] =
    sql"""
      SELECT
        id,
        title,
        content,
        created_at,
        updated_at
      FROM notes
      WHERE id = $id
    """
      .query[Note]
      .option
      .transact(xa)

  override def create(noteInfo: NoteInfo): IO[Note] =
    sql"""
      INSERT INTO notes(
        title,
        content
      ) VALUES(
        ${noteInfo.title},
        ${noteInfo.content}
      )
    """.update
      .withUniqueGeneratedKeys[Note]("id", "title", "content", "created_at", "updated_at")
      .transact(xa)

  override def update(id: UUID, noteInfo: NoteInfo): IO[Option[Note]] =
    sql"""
    UPDATE notes
    SET
      title = ${noteInfo.title},
      content = ${noteInfo.content}
    WHERE id = $id
    RETURNING id, title, content, created_at, updated_at
  """
      .query[Note]
      .option
      .transact(xa)

  override def delete(id: UUID): IO[Int] =
    sql"DELETE FROM notes WHERE id = $id".update.run.transact(xa)
}

object LiveNotes {
  def apply(xa: Transactor[IO]): IO[LiveNotes] = IO(new LiveNotes(xa))
}
