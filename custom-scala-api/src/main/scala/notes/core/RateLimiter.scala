package notes.core

import cats.effect.IO

import dev.profunktor.redis4cats.RedisCommands
import dev.profunktor.redis4cats.effects.ScriptOutputType

import java.time.Instant

trait RateLimiter {

  /** 주어진 키에 대한 요청이 처리 한도(rate limit) 내에 있는지 확인합니다.
    *
    * @param key
    *   고유 키 (예: IP 주소 또는 사용자 ID)
    * @param maxRequests
    *   해당 시간 내에 허용되는 최대 요청 수
    * @param windowSeconds
    *   제한 시간(윈도우)의 길이
    * @return
    *   허용된 경우 true, 한도를 초과한 경우 false
    */
  def isAllowed(key: String, maxRequests: Int, windowSeconds: Int): IO[Boolean]
}

// 이미 연결된 레디스 커넥션 명령어를 생성자로 주입받습니다.
class LiveRateLimiter private (redisCmd: RedisCommands[IO, String, String]) extends RateLimiter {

  // 원자성(Atomicity)을 보장하는 슬라이딩 윈도우 Lua 스크립트
  private val slidingWindowLua: String =
    """
      |local key = KEYS[1]
      |local now = tonumber(ARGV[1])
      |local window = tonumber(ARGV[2])
      |local limit = tonumber(ARGV[3])
      |
      |-- 윈도우 범위를 벗어난 오래된 타임스탬프 기록 삭제
      |local clearBefore = now - window
      |redis.call('zremrangebyscore', key, '-inf', clearBefore)
      |
      |-- 현재 윈도우 내의 요청 횟수 확인
      |local currentRequests = redis.call('zcard', key)
      |
      |if currentRequests < limit then
      |    -- 제한 미만이면 현재 시간 추가 후 승인 (1 리턴)
      |    redis.call('zadd', key, now, now)
      |    redis.call('expire', key, math.ceil(window / 1000) + 1)
      |    return 1
      |else
      |    -- 제한 초과 시 차단 (0 리턴)
      |    return 0
      |end
    """.stripMargin

  // 2. 요청 허용 여부를 판단하는 핵심 메서드
  override def isAllowed(key: String, maxRequests: Int, windowSeconds: Int): IO[Boolean] = {
    val limitKey = s"rate:my-rate-limit"

    // Resource 패턴을 통해 사용 후 커넥션 풀 자원을 안전하게 자동 해제

    for {
      now <- IO(Instant.now().toEpochMilli) // 현재 타임스탬프 (ms)
      windowMs = windowSeconds * 1000

      // Lua 스크립트 실행 (리턴 타입은 RedisType.Integer -> Long 매핑)
      result <- redisCmd.eval(
        script = slidingWindowLua,
        output = ScriptOutputType.Integer,
        keys = List(limitKey),
        values = List(now.toString, windowMs.toString, maxRequests.toString)
      )
    } yield result == 1L // 1이면 true(승인), 0이면 false(차단)

  }
}

object LiveRateLimiter {
  def apply(redis: RedisCommands[IO, String, String]): IO[LiveRateLimiter] =
    IO(new LiveRateLimiter(redis))
}
