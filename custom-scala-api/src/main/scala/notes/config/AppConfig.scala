package notes.config

import pureconfig.ConfigReader

final case class AppConfig(emberConfig: EmberConfig) derives ConfigReader
