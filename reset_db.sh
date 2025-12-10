#!/bin/bash

# Configuration
CONTAINER_NAME="waterballsa-postgres"
DB_USER="postgres"
DB_NAME="waterballsa"
SCHEMA_FILE="backend/spec/data/schema.sql"

echo "Checking container..."
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Error: Container $CONTAINER_NAME is not running."
    exit 1
fi

echo "Dropping public schema..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Applying new schema..."
docker cp $SCHEMA_FILE $CONTAINER_NAME:/tmp/schema.sql
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -f /tmp/schema.sql

echo "Applying seed data..."
./insert_seed_data.sh

echo "Database reset completed."
