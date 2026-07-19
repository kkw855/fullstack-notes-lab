import Axios /*, { InternalAxiosRequestConfig }*/ from 'axios'

// import { useNotifications } from '@/components/ui/notifications'
// import { env } from '@/config/env'
// import { paths } from '@/config/paths'

// function authRequestInterceptor(config: InternalAxiosRequestConfig) {
//   if (config.headers) {
//     config.headers.Accept = 'application/json'
//   }
//
//   config.withCredentials = true
//   return config
// }

export const api = Axios.create({
  // baseURL: env.API_URL,
  baseURL: '/api',
  // 💡 200대 코드가 아니어도 304라면 에러를 던지지 말고 정상 응답으로 처리하라고 명령합니다.
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
})

// api.interceptors.request.use(authRequestInterceptor)
// api.interceptors.response.use(
//   (response) => {
//     return response.data
//   },
//   (error) => {
//     const message = error.response?.data?.message || error.message
//     useNotifications.getState().addNotification({
//       type: 'error',
//       title: 'Error',
//       message,
//     })
//
//     if (error.response?.status === 401) {
//       const searchParams = new URLSearchParams()
//       const redirectTo =
//         searchParams.get('redirectTo') || window.location.pathname
//       window.location.href = paths.auth.login.getHref(redirectTo)
//     }
//
//     return Promise.reject(error)
//   },
// )
