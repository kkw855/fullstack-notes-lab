package notes.fixtures

import java.util.UUID

trait UserFixture {
  val timestampEmail = "timestamp@example.com"
  val duplicateEmail = "duplicate@example.com"
  val raceEmail = "race@example.com"
  val findEmail = "find@example.com"
  val caseEmail = "Case@example.com"
  val roundTripEmail = "roundtrip@example.com"

  val passwordHash1 = "$argon2id$v=19$m=15360,t=2,p=1$c2FsdDFzYWx0MXNhbHQx$aGFzaDFoYXNoMWhhc2gx"
  val passwordHash2 = "$argon2id$v=19$m=15360,t=2,p=1$c2FsdDJzYWx0MnNhbHQy$aGFzaDJoYXNoMmhhc2gy"

  val nonExistentUserId: UUID = UUID.fromString("00000000-0000-0000-0000-000000000000")
}

object UserFixture extends UserFixture
