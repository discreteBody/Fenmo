# Stage 1: Build
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Copy maven wrapper and pom file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# FIX: Grant execution permission to the maven wrapper [cite: 6]
RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline

# Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests