# syntax=docker/dockerfile:1

# ==========================================
# 1단계: 빌드 스테이지 (Gradle이 이미 설치된 공식 이미지 사용)
# ==========================================
# 💡 gradlew가 빌드 중 Gradle 배포판을 인터넷에서 새로 받게 하면,
#    클러스터 네트워크(Flannel VXLAN) 환경에서 대용량 다운로드가 멈추는 문제가 있어
#    Gradle이 이미 내장된 공식 이미지를 사용합니다 (버전은 gradle-wrapper.properties와 동일하게 유지).
FROM gradle:9.5.1-jdk21 AS builder

WORKDIR /app

# [최적화 팁] 의존성 캐싱을 위해 빌드 설정 파일 먼저 복사
COPY build.gradle.kts settings.gradle.kts /app/

# 소스코드 없이 의존성만 미리 받아 빌드 속도 향상 (Docker 레이어 캐시 활용)
RUN gradle dependencies --no-daemon

# 나머지 소스코드 복사 및 실행 가능한 Spring Boot JAR 생성
COPY . /app
RUN gradle bootJar --no-daemon -x test

# ==========================================
# 2단계: 런타임 스테이지 (최소한의 가벼운 JRE만 포함)
# ==========================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# 보안 가이드: 프로덕션에서는 절대 root 계정으로 컨테이너를 구동하지 않습니다.
RUN useradd -u 1001 kotlin-user
USER kotlin-user

# 1단계 빌드 결과물(Spring Boot 실행 가능 JAR)만 가볍게 복사
COPY --from=builder --chown=kotlin-user:kotlin-user /app/build/libs/*.jar ./app.jar

# 쿠버네티스 컨테이너 환경을 위한 필수 JVM 최적화 옵션 설정
# - MaxRAMPercentage: 쿠버네티스 파드 메모리 Limit의 75%를 JVM 힙 메모리로 할당 (OOMKilled 방지)
ENV JAVA_OPTS="-XX:+ExitOnOutOfMemoryError \
               -XX:InitialRAMPercentage=50.0 \
               -XX:MaxRAMPercentage=75.0"

# 애플리케이션 포트 개방
EXPOSE 5003

# 실행 명령
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
