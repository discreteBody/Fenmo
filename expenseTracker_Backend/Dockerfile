# ... Stage 1 remains the same ...
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Explicitly copy the jar.
# Note: Check your pom.xml <artifactId>. If it's 'fenmo', the jar is 'fenmo-0.0.1-SNAPSHOT.jar'
COPY --from=build /app/target/*.jar app.jar

# Force the entrypoint to use the JAR launcher
ENTRYPOINT ["java", "-Xmx512m", "-jar", "/app/app.jar"]