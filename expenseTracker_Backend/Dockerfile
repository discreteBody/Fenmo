FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app

# Copy all files from the backend directory
COPY . .

# Fix permissions and build the jar
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Find the jar and rename it to app.jar to be 100% sure of the path
RUN mv target/*.jar app.jar

# Explicitly set the port and the entrypoint
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]