import Redis from 'ioredis'

import dotenv from 'dotenv'

dotenv.config()

// Redis Sentinel 연결 설정
const redis = new Redis({
  // 1. 센티널 노드 주소 지정 (여러 개 등록 가능하지만 서비스 도메인 하나로 가능)
  sentinels: [
    { host: process.env.REDIS_REST_HOST, port: process.env.REDIS_REST_PORT }
  ],
  // 2. 우리가 yaml에 정한 마스터 셋 이름
  name: process.env.REDIS_REST_MASTER_SET,

  // 3. 인증 비밀번호 (Bitnami 차트는 기본적으로 마스터와 센티널 비밀번호가 같습니다)
  password: process.env.REDIS_REST_PASSWORD,
  sentinelPassword: process.env.REDIS_REST_PASSWORD,

  // 4. 안전장치 옵션 (선택)
  role: 'master', // 읽기/쓰기를 모두 해야 하므로 master로 지정
})

export default redis
