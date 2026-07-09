package notes.modules

import cats.effect.{IO, Resource}

import doobie.hikari.HikariTransactor
import doobie.util.ExecutionContexts

import notes.config.PostgresConfig

object Database {
  def makePostgresResource(config: PostgresConfig): Resource[IO, HikariTransactor[IO]] =
    for {
      ec <- ExecutionContexts.fixedThreadPool(config.nThreads)
      xa <- HikariTransactor.newHikariTransactor[IO](
        "org.postgresql.Driver",
        config.url,
        config.user,
        config.pass,
        ec
      )
    } yield xa
}
