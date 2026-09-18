package notes.config

import pureconfig.ConfigReader

import scala.concurrent.duration.FiniteDuration

case class SessionConfig(ttl: FiniteDuration, cookieSecure: Boolean) derives ConfigReader
