package notes

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CustomKotlinApiApplication

fun main(args: Array<String>) {
    runApplication<CustomKotlinApiApplication>(*args)
}
