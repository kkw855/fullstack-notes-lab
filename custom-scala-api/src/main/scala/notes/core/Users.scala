package notes.core

import cats.effect.IO

import doobie.Transactor
import doobie.implicits.*
import doobie.postgres.implicits.*
import doobie.postgres.sqlstate

import java.util.UUID

import notes.domain.user.*

trait Users {

  /** 이메일이 이미 있으면 None */
  def create(email: String, passwordHash: String): IO[Option[User]]

  /** 로그인 검증용: 사용자와 저장된 해시를 함께 조회 */
  def findWithHash(email: String): IO[Option[(User, String)]]

  def find(id: UUID): IO[Option[User]]
}

class LiveUsers private (xa: Transactor[IO]) extends Users {

  override def create(email: String, passwordHash: String): IO[Option[User]] =
    sql"""
      INSERT INTO users(
        email,
        password_hash
      ) VALUES(
        $email,
        $passwordHash
      )
    """
      .update
      .withUniqueGeneratedKeys[User]("id", "email", "created_at", "updated_at")
      // UNIQUE 제약 위반(23505)만 잡아서 None 으로 바꾸고, 나머지 에러는 그대로 올린다
      .attemptSomeSqlState { case sqlstate.class23.UNIQUE_VIOLATION => () }
      .map(_.toOption)
      .transact(xa)

  override def findWithHash(email: String): IO[Option[(User, String)]] =
    sql"""
      SELECT
        id,
        email,
        created_at,
        updated_at,
        password_hash
      FROM users
      WHERE email = $email
    """
      .query[(User, String)]
      .option
      .transact(xa)

  override def find(id: UUID): IO[Option[User]] =
    sql"""
      SELECT
        id,
        email,
        created_at,
        updated_at
      FROM users
      WHERE id = $id
    """
      .query[User]
      .option
      .transact(xa)
}

object LiveUsers {
  def apply(xa: Transactor[IO]): IO[LiveUsers] = IO(new LiveUsers(xa))
}
