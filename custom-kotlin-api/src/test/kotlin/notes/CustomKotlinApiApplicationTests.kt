package notes

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.utility.DockerImageName

@Testcontainers
@SpringBootTest
class CustomKotlinApiApplicationTests {

    @TestConfiguration(proxyBeanMethods = false)
    class TestcontainersConfiguration {
        @Bean
        @ServiceConnection
        fun postgresContainer(): PostgreSQLContainer<*> =
            PostgreSQLContainer(DockerImageName.parse("postgres:18.4"))
    }

    @Test
    fun contextLoads() {
    }

}
