import { QueryClient } from '@tanstack/react-query'
import {
  Outlet,
  createMemoryHistory,
  createRootRouteWithContext,
  createRouter,
} from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { Route as CreateRouteImport } from '#/routes/create'
import { Route as IndexRouteImport } from '#/routes/index'
import { Route as NoteIdRouteImport } from '#/routes/note.$id'

// 💡 실제 src/router.tsx와 동일한 라우트(loader/component)를 재사용하되,
// __root.tsx의 <html>/<body> 셸 대신 jsdom에서 바로 마운트 가능한 가벼운 루트를 씁니다.
// 그래야 실제 라우팅, 로더, 쿼리 캐시, 네비게이션까지 검증하는 진짜 통합 테스트가 됩니다.
function createTestRouteTree() {
  const rootRoute = createRootRouteWithContext<{
    queryClient: QueryClient
  }>()({
    component: () => <Outlet />,
  })

  return rootRoute.addChildren([
    IndexRouteImport.update({
      id: '/',
      path: '/',
      getParentRoute: () => rootRoute,
    } as any),
    CreateRouteImport.update({
      id: '/create',
      path: '/create',
      getParentRoute: () => rootRoute,
    } as any),
    NoteIdRouteImport.update({
      id: '/note/$id',
      path: '/note/$id',
      getParentRoute: () => rootRoute,
    } as any),
  ])
}

export function createTestRouter({
  initialLocation = '/',
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
}: {
  initialLocation?: string
  queryClient?: QueryClient
} = {}) {
  const router = createRouter({
    routeTree: createTestRouteTree(),
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialLocation] }),
    defaultPreload: false,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return { router, queryClient }
}
