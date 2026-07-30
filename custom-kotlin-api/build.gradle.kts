plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"
    id("org.springframework.boot") version "4.1.0"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "2.3.21"
}

group = "notes"
version = "0.0.1-SNAPSHOT"
description = "custom-kotlin-api"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencyManagement {
    imports {
        // Spring Boot 4.1.0의 dependency-management가 testcontainers 버전을 자동 관리하지 않아 명시적으로 BOM import
        mavenBom("org.testcontainers:testcontainers-bom:2.0.5")
    }
}

dependencies {
    // Web
    implementation("org.springframework.boot:spring-boot-starter-web")

    // 쿠버네티스 readiness/liveness probe용 /actuator/health 엔드포인트
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // JPA & jOOQ
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-jooq")

    // Kotlin & Postgres
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    runtimeOnly("org.postgresql:postgresql")

    // Flyway - DB 스키마 마이그레이션 (앱 시작 시 자동 실행)
    // 💡 Spring Boot 4.x부터는 auto-configuration이 모듈화되어, flyway-core만 넣으면 인식이 안 되고
    //    반드시 spring-boot-starter-flyway를 추가해야 자동설정이 활성화됩니다.
    implementation("org.springframework.boot:spring-boot-starter-flyway")
    implementation("org.flywaydb:flyway-database-postgresql")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    implementation(kotlin("stdlib"))

    // Testcontainers - @SpringBootTest가 실제 DB(Flyway 마이그레이션 포함)에 접속해서
    // 컨텍스트를 로드할 수 있도록 테스트 전용 임시 Postgres 컨테이너 사용
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:testcontainers-postgresql")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
