package notes

import cats.effect.*

import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

import pureconfig.ConfigSource
import pureconfig.module.catseffect.syntax.* // ConfigSource.default.loadF[IO, AppConfig]()

import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.Server

import notes.config.AppConfig
import notes.modules.HttpApi

object Application extends IOApp.Simple {

  given logger: Logger[IO] = Slf4jLogger.getLogger[IO]

  override def run: IO[Unit] =
    ConfigSource.default.loadF[IO, AppConfig]().flatMap { case AppConfig(emberConfig) =>
      val httpApi = HttpApi()

      val appResource: Resource[IO, Server] = EmberServerBuilder
        .default[IO]
        .withHost(emberConfig.host)
        .withPort(emberConfig.port)
        .withHttpApp(httpApi.endPoints.orNotFound)
        .build

      appResource
        .evalTap(server => logger.info(s"Server started on PORT: ${server.address.getPort}"))
        .useForever
    }
}
