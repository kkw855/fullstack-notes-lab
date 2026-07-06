# Decisions

### 프로젝트 구조
- 부모 프로젝트 아래에 세 개의 하위 프로젝트를 둔다.
- `frontend/`: 공용 React 프론트엔드
- `course-mern-api/`: 강의 코드를 그대로 따라 하는 프로젝트
- `custom-scala-api/`: Scala Cats Effect로 재구현하는 프로젝트

### 강의 프로젝트
- 유튜브 강의: MERN Stack Tutorial for Beginners with Deployment – 2025
- 목적: 강의 흐름을 최대한 그대로 따라 하면서 MERN 풀스택 구조 익히기
- 임의 리팩터링은 하지 않는다.

### 커스텀 프로젝트
- 백엔드는 Scala 3 + Cats Effect + http4s 사용
- DB는 PostgreSQL 사용
- JSON은 Circe 사용
- DB 접근은 doobie 사용

### 작업 원칙
- 강의 프로젝트는 “따라 하기”가 우선이다.
- 커스텀 프로젝트는 강의 기능을 참고하되 구조는 Scala 방식으로 설계한다.
- 두 프로젝트의 기능을 1:1로 비교할 수 있게 진행한다.
