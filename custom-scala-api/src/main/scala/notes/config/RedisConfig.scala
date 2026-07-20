package notes.config

import pureconfig.ConfigReader

import com.comcast.ip4s.{Host, Port}

import notes.config.EmberConfig.given

final case class RedisConfig(
    host: Host,
    port: Port,
    pass: String,
    masterSet: String,
    useSystemDnsResolver: Boolean = false
) derives ConfigReader
