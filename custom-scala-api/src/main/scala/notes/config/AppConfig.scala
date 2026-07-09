package notes.config

import pureconfig.ConfigReader

final case class AppConfig(postgresConfig: PostgresConfig, emberConfig: EmberConfig)
    derives ConfigReader
