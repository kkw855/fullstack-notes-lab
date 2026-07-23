# Course Log

## Current parity point

- `course-mern-api`와 `custom-scala-api` 모두 Notes CRUD API를 제공한다.
- 공용 프런트엔드는 목록, 상세 조회, 생성, 수정, 삭제 API를 사용한다.
- 엔드포인트별 요청과 응답 형식은 [`api-contract.md`](./api-contract.md)를 기준으로 비교한다.

## Implemented parity

| Feature | `course-mern-api` | `custom-scala-api` |
| --- | --- | --- |
| 목록 조회 | `GET /api/notes` | `GET /api/notes` |
| 단건 조회 | `GET /api/notes/:id` | `GET /api/notes/:id` |
| 생성 | `POST /api/notes` | `POST /api/notes` |
| 수정 | `PUT /api/notes/:id` | `PUT /api/notes/:id` |
| 삭제 | `DELETE /api/notes/:id` | `DELETE /api/notes/:id` |
| 목록 정렬 | 최신 생성 순 | 최신 생성 순 |
| 성공 응답 모델 | `Note` JSON | `Note` JSON |
| 요청 제한 | Redis sliding window | Redis sliding window |

## Implementation mapping

- `course-mern-api`: Express + Mongoose + MongoDB, 로컬 포트 `5001`
- `custom-scala-api`: Scala 3 + Cats Effect + http4s + doobie + PostgreSQL, 로컬 포트 `5002`
- MongoDB ObjectId와 PostgreSQL UUID는 공용 프런트엔드에서 모두 `string`으로 취급한다.
- MongoDB의 `createdAt`, `updatedAt`과 PostgreSQL의 `created_at`, `updated_at`은 동일한 JSON 필드명으로 응답한다.

## Remaining differences

- 오류 응답은 MERN API가 `message`, Scala API가 주로 `error` 필드를 사용한다.
- MERN API는 API middleware 전체에 20초당 10회 요청 제한을 적용한다.
- Scala API는 현재 목록 조회에만 60초당 10회 요청 제한을 적용한다.
- Scala API는 공백 문자열을 명시적으로 검증하지만 MERN API는 Mongoose의 `required` 검증을 사용한다.
- Scala API만 `GET /api/health`를 제공한다.

## Next parity work

- 오류 응답 형식과 상태 코드를 공통 계약으로 통일한다.
- 요청 제한의 적용 범위, 식별 키, 시간 구간을 동일하게 맞춘다.
- 두 API에 같은 CRUD 계약 테스트를 실행해 동작 차이를 자동으로 검출한다.
