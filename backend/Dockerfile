# Development Dockerfile for Spring Boot
FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Expose port
EXPOSE 8080

# Run with Spring Boot Maven plugin (hot reload enabled)
CMD ["mvn", "spring-boot:run"]
