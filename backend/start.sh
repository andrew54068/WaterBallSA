#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Warning: .env file not found!"
    exit 1
fi

# Start Spring Boot application
echo "Starting WaterBallSA Backend..."
echo "Google OAuth Client ID: ${GOOGLE_OAUTH_CLIENT_ID:0:20}..."
echo "JWT Secret: ${JWT_SECRET:0:10}..."
echo ""

./mvnw spring-boot:run
