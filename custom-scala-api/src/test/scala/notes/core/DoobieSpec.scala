package notes.core

import cats.effect.IO

import doobie.hikari.HikariTransactor
import doobie.util.ExecutionContexts

import com.dimafeng.testcontainers.PostgreSQLContainer
import com.dimafeng.testcontainers.scalatest.TestContainerForAll
import org.scalatest.Suite
import org.testcontainers.utility.{DockerImageName, MountableFile}

// 🌟 class -> trait 변경, self: Suite => 추가
trait DoobieSpec extends TestContainerForAll { self: Suite =>

  // 🌟 createContainer()를 오버라이드하여 프로젝트 루트의 ./schema.sql을 직접 마운트합니다.
  override val containerDef: PostgreSQLContainer.Def = new PostgreSQLContainer.Def(
    dockerImageName = DockerImageName.parse("postgres:16-alpine"),
    databaseName = "notes_db",
    username = "test_user",
    password = "test_password"
  ) {
    override def createContainer(): PostgreSQLContainer = {
      val container = super.createContainer()
      // 루트의 ./schema.sql -> PostgreSQL 자동 실행 경로로 복사
      container.container.withCopyFileToContainer(
        MountableFile.forHostPath("./schema.sql"),
        "/docker-entrypoint-initdb.d/01-schema.sql"
      )
      container
    }
  }

  // 🌟 하위 테스트 클래스에서 접근할 수 있도록 protected로 변경
  // 범용성을 위해 Notes 대신 Transactor(xa)를 넘겨주는 방식으로 구성하는 것을 추천합니다.
  protected def withTransactor[A](test: HikariTransactor[IO] => IO[A]): IO[A] =
    withContainers { container =>
      val resource = for {
        ec <- ExecutionContexts.fixedThreadPool[IO](4)
        xa <- HikariTransactor.newHikariTransactor[IO](
          driverClassName = container.driverClassName,
          url = container.jdbcUrl,
          user = container.username,
          pass = container.password,
          connectEC = ec
        )
      } yield xa

      resource.use(test)
    }
}
