package notes.http.responses

import io.circe.Codec

final case class FailureResponse(error: String) derives Codec.AsObject
