# ==============================================================================
# AlumniConnect Backend Dockerfile
# Multi-Stage Build: Maven Build -> Eclipse Temurin JRE 21 Runtime
# ==============================================================================

# Stage 1: Build JAR with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and pre-fetch dependencies (caching layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads/profiles /app/uploads/resumes && \
    chown -R appuser:appgroup /app

# Copy executable jar from builder stage
COPY --from=builder /app/target/alumniconnect-backend-1.0.0.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
