package notes.http.middleware

import cats.effect.IO
import scala.concurrent.duration.*

import org.http4s.*
import org.http4s.server.middleware.{CORS, CORSPolicy}
import org.typelevel.ci.*

object CorsHandler {
  val policy: CORSPolicy = CORS.policy
    // 출처(Origin)에 상관없이 모든 도메인에서의 요청을 허용
    .withAllowOriginAll
    .withAllowCredentials(false)
    // 허용할 HTTP 메서드 목록
    .withAllowMethodsIn(Set(Method.GET, Method.POST, Method.PUT, Method.DELETE, Method.OPTIONS, Method.PATCH))
    // 클라이언트가 요청 시 실어 보낼 수 있는 허용 헤더 목록을 정의합니다.
    .withAllowHeadersIn(
      Set(
        CIString("Content-Type"),
        CIString("Authorization"),
        CIString("Accept"),
        CIString("Origin"),
        CIString("X-Requested-With")
      )
    )
    // 매 API 요청마다 OPTIONS 요청을 날리지 않아 성능이 향상
    .withMaxAge(1.day)

  def apply(routes: HttpRoutes[IO]): HttpRoutes[IO] = policy(routes)
}
