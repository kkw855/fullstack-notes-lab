import sbtassembly.MergeStrategy

scalaVersion := "3.8.4"

val catsVersion = "2.13.0"
val catsEffectVersion = "3.7.0"
val log4catsVersion = "2.8.0"
val logbackVersion = "1.5.38"
val pureConfigVersion = "0.17.10"
val circeVersion = "0.14.16"
val circeFs2Version = "0.14.1"
val http4sVersion = "0.23.36"
val doobieVersion = "1.0.0-RC12"
val redis4cats = "2.0.5"
val testcontainersScalaVersion = "0.44.1"
val scalaTestVersion = "3.2.20"
val catsEffectTestingVersion = "1.8.0"

lazy val root = rootProject
  .settings(
    name := "custom-scala-api",
    scalacOptions ++= Seq(
      "-deprecation", // 구형 API 사용 시 상세한 경고 출력
      "-Wunused:all", // 모든 미사용 코드 감지
      "-Werror" // 경고(Warning)가 발생하면 컴파일 에러로 취급 (선택 사항)
    ),
    libraryDependencies ++= Seq(
      "org.typelevel" %% "cats-core" % catsVersion,
      "org.typelevel" %% "cats-effect" % catsEffectVersion,
      "org.typelevel" %% "log4cats-slf4j" % log4catsVersion,
      "ch.qos.logback" % "logback-classic" % logbackVersion % Runtime,
      "com.github.pureconfig" %% "pureconfig-core" % pureConfigVersion,
      "com.github.pureconfig" %% "pureconfig-cats-effect" % pureConfigVersion,
      "io.circe" %% "circe-generic" % circeVersion,
      "io.circe" %% "circe-fs2" % circeFs2Version,
      "org.http4s" %% "http4s-ember-server" % http4sVersion,
      "org.http4s" %% "http4s-dsl" % http4sVersion,
      "org.http4s" %% "http4s-circe" % http4sVersion,
      "org.tpolecat" %% "doobie-core" % doobieVersion,
      "org.tpolecat" %% "doobie-hikari" % doobieVersion,
      "org.tpolecat" %% "doobie-postgres" % doobieVersion,
      "org.tpolecat" %% "doobie-scalatest" % doobieVersion % Test,
      "dev.profunktor" %% "redis4cats-effects" % redis4cats,
      "org.scalatest" %% "scalatest" % scalaTestVersion % Test,
      "org.typelevel" %% "cats-effect-testing-scalatest" % catsEffectTestingVersion % Test,
      "com.dimafeng" %% "testcontainers-scala-scalatest" % testcontainersScalaVersion % Test,
      "com.dimafeng" %% "testcontainers-scala-postgresql" % testcontainersScalaVersion % Test
    ),
    Compile / run / mainClass := Some("notes.Application"),
    Compile / run / fork := true,
    Test / fork := true,
    Test / javaOptions += "-Dapi.version=1.40",
    assembly / assemblyJarName := "app.jar",
    assembly / assemblyMergeStrategy := {
      case PathList("META-INF", "maven", xs*) => MergeStrategy.discard
      case PathList("META-INF", xs*) =>
        xs match {
          case "MANIFEST.MF" :: Nil => MergeStrategy.discard
          // cats, http4s 등 서비스 로더 파일들을 하나로 합침
          case "services" :: _ :: Nil => MergeStrategy.concat
          case _ => MergeStrategy.first
        }
      case "reference.conf" => MergeStrategy.concat
      case x => MergeStrategy.first
    }
  )
