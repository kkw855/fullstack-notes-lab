# custom-scala-api 코드베이스 개선 제안 보고서

이 보고서는 `custom-scala-api` 프로젝트를 분석하여 안전성, 성능, 코드 깔끔성, 보안 관점에서 개선할 수 있는 부분들을 정리한 보고서입니다. 사용자의 요청에 따라 실제 소스 코드는 수정하지 않고 분석 내용만 기술합니다.

---

## 1. 개요 및 개선사항 요약

현재 프로젝트는 **Scala 3**, **Cats Effect 3**, **Http4s (Ember)**, **Doobie (PostgreSQL)**를 활용한 전형적인 함수형 마이크로서비스 백엔드 아키텍처를 따르고 있습니다. 전반적인 레이어 구조(Core, Domain, Http, Modules)는 아주 훌륭하게 설계되어 있으나, 실무 프로덕션 운영을 위해 보완할 수 있는 지점들이 확인되었습니다.

### 📌 핵심 개선 요약 테이블

| 번호 | 구분 | 대상 파일 / 위치 | 개선 주제 | 중요도 | 기대 효과 |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | 성능/안전성 | [NoteRoutes.scala:L53-62](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/http/routes/NoteRoutes.scala#L53-L62) | Note 삭제 API의 DB 쿼리 중복 제거 | **상** | DB 부하 감소, Race Condition 방지 |
| **2** | 코드 품질 | [NoteRoutes.scala:L18](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/http/routes/NoteRoutes.scala#L18)<br>[HttpApi.scala:L12](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/modules/HttpApi.scala#L12) | 미사용 클래스 `JsonResult` 제거 | **하** | 코드 복잡도 및 불필요한 바이트코드 감소 |
| **3** | 에러 핸들링 | [syntax.scala:L23-35](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/http/validation/syntax.scala#L23-L35) | JSON 바디 파싱 실패 예외 처리 추가 | **중** | 잘못된 요청 포맷에 대해 일관된 오류 응답 제공 |
| **4** | 성능 최적화 | [Database.scala:L11-21](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/modules/Database.scala#L11-L21) | Hikari CP 스레드 풀 및 풀 사이즈 동기화 | **상** | 커넥션 대기 지연 최소화, 리소스 낭비 방지 |
| **5** | 보안/인프라 | [application.conf](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/resources/application.conf) | 설정 중복 제거 및 환경변수를 이용한 보안 강화 | **상** | 패스워드 등 민감 정보 유출 방지 및 배포 유연성 |
| **6** | 기능 확장 | [HttpApi.scala](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/modules/HttpApi.scala) | CORS 필터 및 전역 에러 처리 미들웨어 추가 | **중** | 프론트엔드 연동 지원 및 예상치 못한 예외 보호 |
| **7** | 테스트 | [src/test](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/test) | 테스트 코드 부재 보완 및 DB 검증 추가 | **중** | 리팩토링 안정성 확보 및 SQL 구문 검증 자동화 |
| **8** | 모니터링 | [resources/logback.xml](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/resources) | Logback 설정 파일 작성 | **하** | 환경별 로그 레벨 관리 및 출력 제어 |

---

## 2. 세부 분석 및 개선 제안

### 1️⃣ Note 삭제 시 중복 DB 조회 제거 (성능 & 동시성)
- **현재 상황**:
  `deleteNoteRoute`에서 `notes.find(id)`를 호출하여 Note의 존재 여부를 먼저 확인한 뒤, 있는 경우에만 `notes.delete(id)`를 실행합니다.
- **문제점**:
    1. 하나의 API 요청에서 **두 번의 데이터베이스 라운드 트립(SELECT 후 DELETE)**이 발생합니다.
    2. 첫 번째 `find` 수행 후 `delete`를 수행하기 직전에 다른 트랜잭션이 해당 데이터를 지웠다면, 예기치 않은 데이터 레이스가 발생할 수 있습니다.
- **개선 제안**:
  `LiveNotes.delete`는 `sql"DELETE...".update.run.transact(xa)`를 통해 삭제된 행의 개수(`IO[Int]`)를 리턴합니다. 이 값을 그대로 활용하여 API 응답 코드를 결정하면 원자성(Atomicity)을 지키고 효율성을 2배 높일 수 있습니다.

```diff
  // NoteRoutes.scala
  private val deleteNoteRoute = HttpRoutes.of[IO] { case DELETE -> Root / UUIDVar(id) =>
-   notes.find(id).flatMap {
-     case Some(_) =>
-       for {
-         _ <- notes.delete(id)
-         resp <- Ok()
-       } yield resp
-     case None => NotFound(FailureResponse(s"Cannot delete note $id: not found"))
-   }
+   notes.delete(id).flatMap {
+     case count if count > 0 => Ok()
+     case _                  => NotFound(FailureResponse(s"Cannot delete note $id: not found"))
+   }
  }
```

---

### 2️⃣ 미사용 코드 `JsonResult` 제거
- **현재 상황**:
  [NoteRoutes.scala](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/http/routes/NoteRoutes.scala#L18)와 [HttpApi.scala](file:///Users/kkw855/IdeaProjects/Projects/fullstack-notes-lab/custom-scala-api/src/main/scala/notes/modules/HttpApi.scala#L12)에 아래 클래스가 중복 선언되어 있습니다.
  `final case class JsonResult(message: String) derives Codec.AsObject`
- **문제점**:
  두 클래스 모두 패키지 내 다른 로직에서 사용되지 않고 있습니다.
- **개선 제안**:
  유지보수성과 가독성을 위해 해당 미사용 클래스는 삭제해야 합니다.

---

### 3️⃣ 잘못된 JSON 포맷 예외 처리 추가 (안전성)
- **현재 상황**:
  `syntax.scala`의 `validate` 확장 메서드에서 `req.as[A]`를 호출하여 JSON 바디를 디코딩합니다.
- **문제점**:
  클라이언트가 필수 필드를 빠뜨리거나 타입이 전혀 맞지 않는 기형적인 JSON을 보내면 `req.as[A]` 호출은 `MessageBodyFailure` 예외를 발생시키며 실패합니다. 이 예외는 바디 유효성 검사 로직(Invalid 분기)을 타지 않고 상위로 바로 버블링되므로, 사용자 정의 포맷인 `FailureResponse` 대신 원시 에러 메시지가 출력되거나 예외 구조가 깨진 응답이 전달됩니다.
- **개선 제案**:
  `handleErrorWith` 블록을 붙여 디코딩 실패 케이스도 가로채서 통일성 있는 `FailureResponse` 형태의 JSON 에러로 만들어 리턴해 줍니다.

```scala
// syntax.scala 내의 validate 확장 메서드 예시
req
  .as[A]
  .map(validateEntity)
  .flatMap {
    case Valid(entity) => serverLogicIfValid(entity)
    case Invalid(errors) => BadRequest(FailureResponse(errors.toList.map(_.errorMessage).mkString(", ")))
  }
  .handleErrorWith {
    case err: org.http4s.MessageBodyFailure =>
      BadRequest(FailureResponse(s"Invalid JSON payload: ${err.getMessage}"))
    case err =>
      InternalServerError(FailureResponse(s"Unexpected server error: ${err.getMessage}"))
  }
```

---

### 4️⃣ Hikari CP 커넥션 풀 크기 설정 누락 보완 (성능 최적화)
- **현재 상황**:
  `Database.makePostgresResource`는 `config.nThreads`(기본 32) 크기의 고정 스레드 풀을 인자로 받아 `HikariTransactor`를 생성합니다.
- **문제점**:
  HikariCP의 기본 커넥션 풀 크기(Maximum Pool Size)는 별도로 튜닝하지 않으면 **10**입니다. 즉, 32개의 스레드가 동시에 DB 작업을 요청해도 10개만 활성화된 커넥션을 나눠 쓰며 대기하게 됩니다. 스레드 풀 크기와 커넥션 풀 크기를 일치시키지 않으면 병목을 체감하기 쉽습니다.
- **개선 제안**:
  transactor를 초기화할 때 `ds.setMaximumPoolSize(config.nThreads)` 설정을 주입하도록 코드를 개선하는 것이 좋습니다.

```scala
// Database.scala 수정 제안 컨셉
def makePostgresResource(config: PostgresConfig): Resource[IO, HikariTransactor[IO]] =
  for {
    ec <- ExecutionContexts.fixedThreadPool(config.nThreads)
    xa <- HikariTransactor.initial[IO](ec).evalMap { xa =>
      xa.configure { ds =>
        IO {
          ds.setDriverClassName("org.postgresql.Driver")
          ds.setJdbcUrl(config.url)
          ds.setUsername(config.user)
          ds.setPassword(config.pass)
          ds.setMaximumPoolSize(config.nThreads) // 스레드 수와 풀 크기 매칭
          ds.setMinimumIdle(config.nThreads / 4)  // 유휴 커넥션 최소 수 유지
          ds.setIdleTimeout(600000)
          ds.setConnectionTimeout(30000)
        }.as(xa)
      }
    }
  } yield xa
```

---

### 5️⃣ 환경 변수 연동을 통한 설정 파일 관리 고도화 (보안 & 유연성)
- **현재 상황**:
  `application.conf` 파일 내부 구성:
  ```hocon
  postgres-config {
    n-threads = 32
    url = "jdbc:postgresql://localhost:5432/notes_db"
    url = "jdbc:postgresql://crud-postgres-rw.postgres:5432/notes_db"
    user = "admin"
    pass = "5q5SP5RIoaq7ZlmBxmtJ4lPjqoXhvcufCJBOngOEEB3PaZckSQ4RZ3vgeU2A2hXP"
  }
  ```
- **문제점**:
    1. `url` 지정을 `localhost`와 `crud-postgres-rw.postgres`로 2번 정의하여 마지막 값이 덮어씌워지고 있어 설정 오해의 소지가 있습니다.
    2. 비밀번호인 `pass` 값이 일반 텍스트로 코드저장소(git)에 포함되기 쉬운 상태로 하드코딩되어 유출 위험이 높습니다.
- **개선 제안**:
  HOCON 문법의 시스템 변수 폴백(Fallback, `${?VAR}`)을 적용하여, 환경 변수가 지정되어 있을 때는 환경 변수를 읽어오고 아닐 때는 로컬 환경용 디폴트 값이 할당되도록 수정해야 합니다.

```hocon
postgres-config {
  n-threads = 32
  n-threads = ${?DB_THREADS}
  
  # 로컬 디폴트와 배포 환경 분리
  url = "jdbc:postgresql://localhost:5432/notes_db"
  url = ${?DB_URL}
  
  user = "admin"
  user = ${?DB_USER}
  
  pass = "local_dev_password"
  pass = ${?DB_PASS}
}
```

---

### 6️⃣ CORS 필터 및 전역 에러 제어용 미들웨어 부재 (기능 확장)
- **현재 상황**:
  `HttpApi`에는 라우터 경로 매핑(`/api` -> `NoteRoutes`)만 설정되어 있고 다른 미들웨어가 없습니다.
- **문제점**:
    1. 프론트엔드 웹 앱(React, Vue 등)이 별도 도메인/포트에서 운영되어 API 서버로 통신하면 브라우저 정책상 **CORS 오류**가 백퍼센트 발생합니다.
    2. 비즈니스 로직 처리 도중 예기치 않게 발생하는 모든 익셉션에 대해 클라이언트 연결이 끊어지거나 디버그에 유용하지 않은 스택 트레이스 응답을 주게 됩니다.
- **개선 제안**:
  Http4s가 기본 제공하는 CORS 미들웨어와 ErrorHandling 미들웨어를 적용합니다.

```scala
// HttpApi.scala 미들웨어 추가 구성 시안
import org.http4s.server.middleware.{CORS, ErrorHandling}

class HttpApi private (core: Core) {
  private val noteRoutes = NoteRoutes(core.notes).routes

  // CORS 기본 정책 및 글로벌 예외 복구 탑재
  val endPoints: HttpRoutes[IO] = ErrorHandling.Recover.total(
    CORS.policy.withAllowOriginAll(
      Router(
        "/api" -> noteRoutes
      )
    )
  )
}
```

---

### 7️⃣ 단위 테스트 및 DB 쿼리 구조 분석 테스트 미작성 (테스트 커버리지)
- **현재 상황**:
  `build.sbt`에 테스트를 위한 `doobie-scalatest`가 포함되어 있고 `src/test/scala` 디렉토리가 있으나 테스트 소스 코드가 하나도 존재하지 않습니다.
- **문제점**:
  API 추가 스펙이 늘어나거나 변경될 때 시스템 안정성을 자동으로 검증할 장치가 부족합니다.
- **개선 제안**:
    1. **Doobie Query Test**: Doobie가 제공하는 `AnalysisSpec` 클래스를 활용해 `LiveNotes`에서 사용 중인 원시 SQL이 실제 데이터베이스 스키마와 타입 호환성이 잘 맞는지 정적 검증을 자동화합니다.
    2. **Http4s Router Test**: `HttpApp[IO]`를 직접 호출하여 실제 서버를 띄우지 않고 메모리 상에서 API 요청을 전달하고 응답 구조를 검증하는 테스트 코드를 작성합니다.

---

### 8️⃣ `logback.xml` 누락 (모니터링)
- **현재 상황**:
  `build.sbt`에는 로거 구현체인 `logback-classic`이 명시되어 있지만 `resources` 폴더 아래 이에 대한 설정 파일(`logback.xml`)이 생략되어 있습니다.
- **문제점**:
  기본 포맷으로만 로그가 출력되며 파일로의 기록 보존, 특정 라이브러리(`doobie`, `http4s`)의 디버그 레벨 로그 출력 여부 등을 조정할 수 없습니다.
- **개선 제안**:
  `src/main/resources/logback.xml` 파일을 추가하여 로그 출력 방식을 구조화하는 것을 제안합니다.
