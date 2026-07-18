// create a ratelimiter that allows 10 requests per 20 seconds
// import { Ratelimit } from '@upstash/ratelimit'
// import { Redis } from '@upstash/redis'
//
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(10, '20 s')
// })
//
// const rateLimiter = async (req, res, next) => {
//
//   try {
//     const { success } = await ratelimit.limit('my-limit-key')
//
//     if (!success) {
//       return res.status(429).json({
//         message: 'Too many requests, please try again later'
//       })
//     }
//
//     next()
//
//   } catch(error) {
//     console.log('Rate limit error', error)
//     next(error)
//   }
// }

import redis from '../config/redis.js'

// 2. Upstash의 slidingWindow 기능을 완벽히 대체하는 고성능 Lua 스크립트 정의
// (여러 노드에서 동시에 요청이 와도 race condition 없이 정확하게 동기화됩니다)
const slidingWindowLua = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  
  -- 20초 범위를 벗어난 과거의 요청 기록 싹 청소하기
  local clearBefore = now - window
  redis.call('zremrangebyscore', key, '-inf', clearBefore)
  
  -- 현재 윈도우 안에 남아있는 요청 횟수 카운트
  local currentRequests = redis.call('zcard', key)
  
  if currentRequests < limit then
      -- 제한 미만이면 현재 시간(타임스탬프)을 기록하고 통과 (1 반환)
      redis.call('zadd', key, now, now)
      -- 자동으로 데이터가 청소되도록 만료시간 설정 (윈도우 크기 + 1초 마진)
      redis.call('expire', key, math.ceil(window / 1000) + 1)
      return 1
  else
      -- 제한 초과 시 차단 (0 반환)
      return 0
  end
`

// ioredis에 커스텀 명령어 등록 (이름: performRateLimit)
redis.defineCommand('performRateLimit', {
  numberOfKeys: 1,
  lua: slidingWindowLua,
})

const rateLimiter = async (req, res, next) => {
  try {
    // 실무에서는 보통 'rate:limit:' + req.ip 또는 유저 ID 조합을 키로 씁니다.
    const limitKey = 'rate:my-rate-limit'

    const now = Date.now()               // 현재 시간 (Millisecond)
    const windowMs = 20 * 1000           // 20초 (Upstash의 '20 s'와 동일)
    const maxRequests = 10               // 최대 허용 횟수

    // 레디스 내부에서 원자적으로 슬라이딩 윈도우 연산 실행
    const result = await redis.performRateLimit(limitKey, now, windowMs, maxRequests)
    const success = result === 1

    if (!success) {
      return res.status(429).json({
        message: 'Too many requests, please try again later'
      })
    }

    next()

  } catch(error) {
    console.log('Rate limit error', error)
    next(error)
  }
}

export default rateLimiter
