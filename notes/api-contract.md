# API Contract

공용 React 프런트엔드가 사용하는 Notes API 계약이다. 성공 응답은 두 백엔드가 같은 JSON 형태를 제공하는 것을 목표로 하며, 현재 구현 차이는 마지막 절에 별도로 기록한다.

## Base URLs

| API | Local base URL |
| --- | --- |
| `course-mern-api` | `http://localhost:5001/api` |
| `custom-scala-api` | `http://localhost:5002/api` |

요청과 JSON 응답의 `Content-Type`은 `application/json`이다. Health 응답은 예외적으로 `text/plain`이다.

## Data Models

### Note

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "API contract 정리",
  "content": "Notes API의 요청과 응답 형식을 기록한다.",
  "createdAt": "2026-07-23T09:30:00+09:00",
  "updatedAt": "2026-07-23T09:30:00+09:00"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | 노트 식별자. Scala API는 UUID, MERN API는 MongoDB ObjectId 문자열을 사용한다. |
| `title` | string | 노트 제목 |
| `content` | string | 노트 본문 |
| `createdAt` | string | ISO 8601 형식의 생성 시각 |
| `updatedAt` | string | ISO 8601 형식의 최종 수정 시각 |

### NoteInput

생성과 수정 요청은 같은 입력 형식을 사용한다.

```json
{
  "title": "API contract 정리",
  "content": "Notes API의 요청과 응답 형식을 기록한다."
}
```

`title`과 `content`는 필수이며 공백만으로 구성할 수 없다.

## Endpoints

| Method | Path | Success | Response |
| --- | --- | --- | --- |
| `GET` | `/notes` | `200 OK` | `Note[]` |
| `GET` | `/notes/{id}` | `200 OK` | `Note` |
| `POST` | `/notes` | `201 Created` | 생성된 `Note` |
| `PUT` | `/notes/{id}` | `200 OK` | 수정된 `Note` |
| `DELETE` | `/notes/{id}` | `200 OK` | 성공 메시지 |

### List Notes

```http
GET /api/notes
```

최신 노트부터 `createdAt` 내림차순으로 반환한다.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "API contract 정리",
    "content": "Notes API의 요청과 응답 형식을 기록한다.",
    "createdAt": "2026-07-23T09:30:00+09:00",
    "updatedAt": "2026-07-23T09:30:00+09:00"
  }
]
```

노트가 없으면 빈 배열 `[]`을 반환한다.

### Get Note

```http
GET /api/notes/{id}
```

존재하는 노트는 `200 OK`와 `Note`를 반환한다. 노트가 없으면 `404 Not Found`를 반환한다.

### Create Note

```http
POST /api/notes
Content-Type: application/json

{
  "title": "API contract 정리",
  "content": "Notes API의 요청과 응답 형식을 기록한다."
}
```

생성에 성공하면 `201 Created`와 생성된 `Note`를 반환한다.

### Update Note

```http
PUT /api/notes/{id}
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 본문"
}
```

수정에 성공하면 `200 OK`와 수정된 `Note`를 반환한다. 노트가 없으면 `404 Not Found`를 반환한다.

### Delete Note

```http
DELETE /api/notes/{id}
```

삭제에 성공하면 다음 응답을 반환한다.

```json
{
  "message": "Note deleted successfully!"
}
```

노트가 없으면 `404 Not Found`를 반환한다.

## Scala API Error Responses

`custom-scala-api`의 오류 응답은 `error` 필드를 사용한다.

```json
{
  "error": "오류 메시지"
}
```

| Status | Condition | Example |
| --- | --- | --- |
| `400 Bad Request` | JSON 형식 또는 필수 필드가 올바르지 않음 | `{"error":"'title' is empty"}` |
| `404 Not Found` | 요청한 노트가 없음 | `{"error":"Note 550e8400-e29b-41d4-a716-446655440000 not found."}` |
| `429 Too Many Requests` | 목록 조회가 60초 동안 10회를 초과함 | `{"message":"Too many requests, please try again later"}` |
| `500 Internal Server Error` | 처리 중 예기치 않은 오류가 발생함 | `{"error":"Unexpected server error: ..."}` |

현재 Scala API의 rate limit은 `GET /api/notes`에만 적용된다.

## Health

`custom-scala-api`가 제공하는 애플리케이션 health endpoint다.

```http
GET /api/health
```

```text
All going great!
```

성공 상태는 `200 OK`다.

## Current Compatibility Differences

| Area | `course-mern-api` | `custom-scala-api` |
| --- | --- | --- |
| ID format | MongoDB ObjectId | UUID |
| Error field | `message` | 주로 `error`; 429는 `message` |
| Empty-field validation | Mongoose required validation | 공백 제거 후 빈 문자열 검사 |
| Rate limit | API middleware, 20초당 10회 | 목록 조회, 60초당 10회 |
| Health endpoint | 없음 | `GET /api/health` |

공용 프런트엔드는 식별자를 `string`으로 취급하므로 두 ID 형식을 모두 전달할 수 있다. 오류 응답과 rate limit 정책은 아직 완전히 동일하지 않다.
