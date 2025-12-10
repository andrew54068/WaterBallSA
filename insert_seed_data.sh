#!/bin/bash

# Configuration
CONTAINER_NAME="waterballsa-postgres"
DB_USER="postgres"
DB_NAME="waterballsa"
SEED_FILE="backend/spec/data/seed.sql"

# Check if the container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Error: Container $CONTAINER_NAME is not running."
    exit 1
fi

echo "Copying seed file to container..."
docker cp $SEED_FILE $CONTAINER_NAME:/tmp/seed.sql

echo "Executing seed data..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -f /tmp/seed.sql

echo "Seed data insertion completed."
