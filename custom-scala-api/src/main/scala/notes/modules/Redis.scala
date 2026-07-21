package notes.modules

import cats.effect.{IO, Resource}

import dev.profunktor.redis4cats.config.Redis4CatsConfig
import dev.profunktor.redis4cats.connection.{
  RedisClient,
  RedisCredentials,
  RedisUriConfig,
  SentinelNode
}
import dev.profunktor.redis4cats.data.RedisCodec
import dev.profunktor.redis4cats.effect.Log.Stdout.given
import dev.profunktor.redis4cats.{Redis => Redis4Cats, RedisCommands}

import io.lettuce.core.ClientOptions
import io.lettuce.core.resource.{ClientResources, DefaultClientResources}
import io.netty.resolver.DefaultAddressResolverGroup

import notes.config.RedisConfig

object Redis {

  def makeRedisResource(config: RedisConfig): Resource[IO, RedisCommands[IO, String, String]] = {
    val sentinelNode = SentinelNode(
      host = config.host.toString,
      port = config.port.value,
      password = Some(config.pass)
    )

    val redisUriConfig = RedisUriConfig
      .sentinel(config.masterSet, sentinelNode)
      .withCredentials(RedisCredentials.Password(config.pass))

    for {
      client <- redisClient(redisUriConfig)
      commands <- Redis4Cats[IO].fromClient(client, RedisCodec.Utf8)
    } yield commands
  }

  private def redisClient(
      redisUriConfig: RedisUriConfig
  ): Resource[IO, RedisClient] =
    for {
      resources <- systemDnsClientResources
      redis4CatsConfig = Redis4CatsConfig().withClientResources(resources)
      client <- RedisClient[IO].fromConfig(
        redisUriConfig,
        ClientOptions.create(),
        redis4CatsConfig
      )
    } yield client

  private val systemDnsClientResources: Resource[IO, ClientResources] =
    Resource.make {
      IO.blocking(
        DefaultClientResources
          .builder()
          .addressResolverGroup(DefaultAddressResolverGroup.INSTANCE)
          .build()
      )
    } { resources =>
      IO.blocking(resources.shutdown()).void
    }
}
