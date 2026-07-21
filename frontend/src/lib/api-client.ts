import Axios from 'axios'

export const api = Axios.create({
  // baseURL: env.API_URL,
  // 브라우저에서는 Vite dev 서버(또는 프로덕션 인프라)가 /api를 백엔드로 프록시해 주지만,
  // SSR(Node)에는 그런 origin/프록시가 없어 상대 경로를 그대로 쓰면 axios가 Invalid URL을 던진다.
  baseURL: import.meta.env.SSR
    ? (process.env.API_SSR_URL ?? 'http://localhost:5002/api')
    : '/api',
  // 💡 200대 코드가 아니어도 304라면 에러를 던지지 말고 정상 응답으로 처리하라고 명령합니다.
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
})
