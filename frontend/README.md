# Notes 프론트엔드

Notes 앱의 공용 React 프론트엔드입니다. 같은 기능을 여러 방식으로 구현한 백엔드(MERN / Scala / Kotlin)에 동일한 API 계약으로 붙어 동작합니다.

[TanStack Start](https://tanstack.com/start)(SSR) + [TanStack Router](https://tanstack.com/router)(파일 기반 라우팅) + [TanStack Query](https://tanstack.com/query) 조합이며, 스타일은 Tailwind CSS v4를 사용합니다.

## 요구 사항

- Node.js 22 이상
- 실행 중인 백엔드 API 한 개

## 시작하기

```bash
npm install
npm run dev
```

`http://localhost:3000`에서 열립니다.

브라우저의 `/api` 요청은 Vite dev 서버가 백엔드로 프록시합니다. 기본 대상은 `http://localhost:5002`(Scala API)이며, [`vite.config.ts`](./vite.config.ts)의 `server.proxy`에서 바꿀 수 있습니다.

| 백엔드              | 포트 |
| ------------------- | ---- |
| `course-mern-api`   | 5001 |
| `custom-scala-api`  | 5002 |
| `custom-kotlin-api` | 5003 |

엔드포인트와 응답 형식은 [`notes/api-contract.md`](../notes/api-contract.md)를 기준으로 합니다.

> SSR 중에는 브라우저 프록시를 탈 수 없어서 [`src/lib/api-client.ts`](./src/lib/api-client.ts)가 절대 URL을 사용합니다. 기본값은 `http://localhost:5002/api`이고 `API_SSR_URL` 환경 변수로 바꿉니다.

## 스크립트

| 명령                      | 설명                                         |
| ------------------------- | -------------------------------------------- |
| `npm run dev`             | 개발 서버 (포트 3000)                        |
| `npm run build`           | 프로덕션 빌드 → `dist/client`, `dist/server` |
| `npm run start`           | 빌드 결과를 Node로 실행                      |
| `npm run test`            | Vitest 워치 모드                             |
| `npm run test:ci`         | 테스트 1회 실행                              |
| `npm run lint`            | ESLint                                       |
| `npm run format`          | Prettier + ESLint 자동 수정                  |
| `npm run check`           | Prettier 검사만                              |
| `npm run generate-routes` | 라우트 트리 수동 생성                        |

## 폴더 구조

```
src/
├── routes/            파일 기반 라우트 (URL = 파일 이름)
│   ├── __root.tsx     HTML 셸, 네비바, 토스터, 테마 초기화 스크립트
│   ├── index.tsx      /         노트 목록
│   ├── create.tsx     /create   노트 작성
│   ├── note.$id.tsx   /note/:id 노트 상세·수정
│   ├── healthz.tsx    /healthz  헬스체크 (API 호출 없음)
│   └── __tests__/     라우트 단위 통합 테스트
├── features/notes/
│   ├── api/           쿼리·뮤테이션 훅 (엔드포인트별 파일 1개)
│   └── components/    노트 카드, 노트 폼 등
├── components/        공통 UI (네비바 등)
├── lib/               axios 인스턴스, react-query 기본 설정
├── testing/           MSW 핸들러, 인메모리 DB, 테스트용 라우터
└── types/api.ts       API 응답 타입
```

`src/routeTree.gen.ts`는 **자동 생성 파일**이라 직접 수정하지 않습니다. 개발 서버가 떠 있으면 라우트 파일 변경 시 자동으로 다시 만들어집니다.

## 데이터 패칭

엔드포인트마다 `queryOptions`를 정의하고, 라우트 로더와 컴포넌트가 그것을 공유합니다.

```tsx
// src/features/notes/api/get-note.ts
export const getNoteQueryOptions = (noteId: string) =>
  queryOptions({
    queryKey: ['notes', noteId],
    queryFn: () => getNote({ noteId }),
  })
```

```tsx
// src/routes/note.$id.tsx
export const Route = createFileRoute('/note/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(getNoteQueryOptions(params.id)),
  pendingComponent: NoteDetailSkeleton,
  component: NoteDetail,
})

function NoteDetail() {
  const { id } = Route.useParams()
  const note = useSuspenseQuery(getNoteQueryOptions(id)).data
  // ...
}
```

- 로더가 `ensureQueryData`로 캐시를 먼저 채우므로 화면이 그려질 때는 데이터가 준비되어 있습니다. `prefetchQuery`와 달리 실패 시 에러를 던져서 라우터가 처리할 수 있습니다.
- `useSuspenseQuery`의 `data`는 `undefined`가 아니라서 방어 코드가 필요 없습니다.
- 로딩 중에는 `pendingComponent`가 보입니다. 이 컴포넌트는 라우트의 Suspense fallback이기도 해서, 로더 대기와 컴포넌트 대기 모두 같은 화면을 씁니다.
- 기본 쿼리 설정(`staleTime` 60초, 재시도 없음)은 [`src/lib/react-query.ts`](./src/lib/react-query.ts)에 있습니다.

## UI

- 공용 컴포넌트는 [`@endsoul/react-ui`](https://www.npmjs.com/package/@endsoul/react-ui)에서 가져옵니다 (`Button`, `Input`, `Tabs`). 스타일시트는 `src/routes/__root.tsx`에서 한 번만 링크합니다.
- 노트 본문은 마크다운입니다. `react-markdown` + `remark-gfm`(표·체크리스트) + `remark-breaks`(줄바꿈 한 번을 `<br>`로)로 렌더링하고, `@tailwindcss/typography`의 `prose` 클래스로 스타일을 입힙니다.
- 노트 상세 화면은 Write / Preview 탭으로 편집과 미리보기를 전환합니다.
- 폼 검증은 `react-hook-form` + `zod`, 알림은 `sonner`를 사용합니다.

## 테스트

Vitest(jsdom) + Testing Library + [MSW](https://mswjs.io/)로 작성한 **통합 테스트**입니다. 컴포넌트를 따로 떼어내지 않고 실제 라우터·쿼리 캐시·로더를 그대로 태워서, 사용자가 화면에서 하는 동작을 그대로 검증합니다.

```bash
npm run test:ci
```

- `src/testing/render-app.tsx` — 원하는 URL에서 앱 전체를 렌더링합니다.
- `src/testing/mocks/handlers.ts` — API 응답을 가로채는 MSW 핸들러입니다.
- `src/testing/mocks/db.ts` — 테스트마다 초기화되는 인메모리 노트 저장소입니다.

특정 테스트에서만 응답을 바꾸려면 `server.use()`로 핸들러를 덮어쓰면 됩니다.

## 프로덕션 실행

```bash
npm run build
npm run start
```

`vite build`가 만드는 `dist/server/server.js`는 리스닝 서버가 아니라 fetch 핸들러입니다. [`server.prod.mjs`](./server.prod.mjs)가 이를 srvx로 감싸서 정적 자산을 먼저 서빙하고, 없으면 SSR로 넘깁니다. 쿠버네티스용 헬스체크 경로(`/healthz`, `/readyz`, `/health`)와 graceful shutdown도 여기서 처리합니다.

| 환경 변수             | 기본값                      | 설명                            |
| --------------------- | --------------------------- | ------------------------------- |
| `PORT`                | `3000`                      | 리스닝 포트                     |
| `HOST`                | `0.0.0.0`                   | 리스닝 주소                     |
| `API_SSR_URL`         | `http://localhost:5002/api` | SSR에서 호출할 백엔드 주소      |
| `SHUTDOWN_TIMEOUT_MS` | `10000`                     | 종료 시 요청 처리 대기 시간     |
| `DRAIN_DELAY_MS`      | `3000`                      | 종료 신호 후 트래픽 드레인 시간 |

### Docker

```bash
docker build -t notes-frontend .
docker run -p 3000:3000 -e API_SSR_URL=http://host.docker.internal:5002/api notes-frontend
```

쿠버네티스 매니페스트는 별도 저장소(`fullstack-notes-frontend-gitops`)에서 관리합니다.

## 참고

- Tailwind CSS v4는 Safari 16.4 / Chrome 111 / Firefox 128 이상을 요구합니다. 더 낮은 버전에서는 `oklch()` 색상이 무시되면서 테두리와 배경색이 어긋나 보일 수 있습니다.
- `src/components/ThemeToggle.tsx`는 현재 화면에 연결되어 있지 않습니다. 테마 전환은 `__root.tsx`의 초기화 스크립트가 `localStorage`와 OS 설정을 읽어 처리합니다.
