package notes.modules

import cats.effect.{IO, Resource}

import doobie.hikari.HikariTransactor

import dev.profunktor.redis4cats.RedisCommands

import notes.core.{LiveNotes, LiveRateLimiter, Notes, RateLimiter}

class Core private (val notes: Notes, val rateLimiter: RateLimiter) {}

object Core {
  def apply(
      xa: HikariTransactor[IO],
      redisCmd: RedisCommands[IO, String, String]
  ): Resource[IO, Core] = {
    val coreIO = for {
      liveNotes <- LiveNotes(xa)
      liveRateLimiter <- LiveRateLimiter(redisCmd)
    } yield new Core(liveNotes, liveRateLimiter)

    Resource.eval(coreIO)
  }
}
