#!/bin/bash

# Configuration
CONTAINER_NAME="waterballsa-postgres"
DB_USER="postgres"
DB_NAME="waterballsa"
CLEAN_FILE="backend/spec/data/clean.sql"

# Check if the container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Error: Container $CONTAINER_NAME is not running."
    exit 1
fi

echo "Copying clean script to container..."
docker cp $CLEAN_FILE $CONTAINER_NAME:/tmp/clean.sql

echo "Cleaning database..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -f /tmp/clean.sql

echo "Database cleaning completed."
