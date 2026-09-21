package notes.core

import cats.effect.IO
import cats.effect.testing.scalatest.AsyncIOSpec

import org.scalatest.OptionValues
import org.scalatest.freespec.AsyncFreeSpec
import org.scalatest.matchers.should.Matchers

import java.util.Locale

import notes.fixtures.UserFixture

class UsersSpec
    extends AsyncFreeSpec
    with AsyncIOSpec
    with Matchers
    with OptionValues
    with DoobieSpec
    with UserFixture {

  private def withUsers[A](test: Users => IO[A]): IO[A] =
    withTransactor { xa =>
      for {
        liveUsers <- LiveUsers(xa)
        result <- test(liveUsers)
      } yield result
    }

  "LiveUsers" - {
    "생성 시 created_at 과 updated_at 이 같은 값으로 채워져야 한다" in withUsers { users =>
      for {
        created <- users.create(timestampEmail, passwordHash1)
      } yield {
        val user = created.value
        user.createdAt shouldBe user.updatedAt
      }
    }

    "이메일은 대소문자를 구분해 저장된다 (정규화는 상위 계층 책임)" in withUsers { users =>
      for {
        _ <- users.create(caseEmail, passwordHash1)
        found <- users.findWithHash(caseEmail.toLowerCase(Locale.ROOT))
      } yield found shouldBe None
    }

    "이미 가입된 이메일로 생성하면 None 을 반환해야 한다" in withUsers { users =>
      for {
        first <- users.create(duplicateEmail, passwordHash1)
        second <- users.create(duplicateEmail, passwordHash2)
      } yield {
        first.value.email shouldBe duplicateEmail
        second shouldBe None
      }
    }

    "같은 이메일로 동시에 가입하면 하나만 성공해야 한다" in withUsers { users =>
      for {
        result <- IO.both(
          users.create(raceEmail, passwordHash1),
          users.create(raceEmail, passwordHash2)
        )
      } yield {
        List(result._1, result._2).flatten should have size 1
      }
    }

    "생성된 ID 로 사용자를 조회할 수 있어야 한다" in withUsers { users =>
      for {
        created <- users.create(findEmail, passwordHash1)
        found <- users.find(created.value.id)
      } yield found shouldBe created
    }

    "존재하지 않는 ID 로 조회하면 None 을 반환해야 한다" in withUsers { users =>
      for {
        found <- users.find(nonExistentUserId)
      } yield found shouldBe None
    }

    "존재하지 않는 이메일로 조회하면 None 을 반환해야 한다" in withUsers { users =>
      for {
        found <- users.findWithHash("no-such-user@example.com")
      } yield found shouldBe None
    }

    "저장한 비밀번호 해시를 이메일로 다시 조회할 수 있어야 한다" in withUsers { users =>
      for {
        created <- users.create(roundTripEmail, passwordHash1)
        found <- users.findWithHash(roundTripEmail)
      } yield {
        val (user, hash) = found.value
        user shouldBe created.value
        hash shouldBe passwordHash1
      }
    }
  }
}
