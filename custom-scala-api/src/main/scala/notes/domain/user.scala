package notes.domain

import io.circe.{Codec, Decoder}

import java.time.OffsetDateTime
import java.util.UUID

object user {
  // 응답용. password_hash 는 절대 담지 않는다.
  final case class User(
      id: UUID,
      email: String,
      createdAt: OffsetDateTime,
      updatedAt: OffsetDateTime
  ) derives Codec.AsObject

  // 요청 본문용. Encoder 가 없어서 실수로 응답에 실어 보낼 수 없다.
  final case class Credentials(email: String, password: String) derives Decoder
}
