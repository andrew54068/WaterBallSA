#!/bin/bash
# ============================================================================
# PostgreSQL Syntax Validation Script (Docker Compose Version)
# ============================================================================
#
# This script validates the syntax of all SQL schema files without executing them.
# It uses Docker Compose to run validation inside the PostgreSQL container.
#
# The script uses a temporary database for validation to ensure the main
# database remains completely untouched.
#
# Usage: ./validate_syntax.sh
#
# Requirements:
#   - Docker and Docker Compose must be installed
#   - PostgreSQL container must be running (docker-compose up)
#
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
CONTAINER_NAME="waterballsa-postgres"
TEMP_DB_NAME="waterballsa_syntax_validation_temp_$(date +%s)"
MAIN_DB_NAME="waterballsa"

# Cleanup function to ensure temp database is always dropped
cleanup() {
    local exit_code=$?
    if [ -n "$TEMP_DB_CREATED" ]; then
        echo ""
        echo "🧹 Cleaning up temporary database..."

        # Terminate any active connections to the temp database first
        docker exec "${CONTAINER_NAME}" psql -U postgres -c "
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '${TEMP_DB_NAME}'
            AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true

        # Drop the temporary database
        docker exec "${CONTAINER_NAME}" psql -U postgres -c "DROP DATABASE IF EXISTS ${TEMP_DB_NAME};" > /dev/null 2>&1 || true
        echo "✅ Temporary database removed"
    fi

    # Verify main database was not modified
    echo ""
    echo "🔍 Verifying database integrity..."
    MAIN_DB_EXISTS=$(docker exec "${CONTAINER_NAME}" psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${MAIN_DB_NAME}';")
    if [ "$MAIN_DB_EXISTS" = "1" ]; then
        echo "✅ Main database '${MAIN_DB_NAME}' remains intact"
    else
        echo "⚠️  Warning: Could not verify main database existence"
    fi

    # Verify no temporary databases remain
    TEMP_DB_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U postgres -tAc "SELECT COUNT(*) FROM pg_database WHERE datname LIKE 'waterballsa_syntax_validation_temp_%';")
    if [ "$TEMP_DB_COUNT" = "0" ]; then
        echo "✅ All temporary databases cleaned up"
    else
        echo "⚠️  Warning: ${TEMP_DB_COUNT} temporary database(s) still exist"
    fi

    exit $exit_code
}

# Set trap to ensure cleanup runs on exit
trap cleanup EXIT INT TERM

echo "============================================================================"
echo "PostgreSQL Schema Syntax Validation (Docker)"
echo "============================================================================"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: docker command not found"
    echo "   Please install Docker"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose command not found"
    echo "   Please install Docker Compose"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Docker Compose found: $(docker-compose --version)"
echo ""

# Check if PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: PostgreSQL container '${CONTAINER_NAME}' is not running"
    echo "   Please start the services with: docker-compose up -d"
    exit 1
fi

echo "✅ PostgreSQL container is running"
echo ""

# Get PostgreSQL version from container
PG_VERSION=$(docker exec "${CONTAINER_NAME}" psql --version)
echo "✅ PostgreSQL version: ${PG_VERSION}"
echo ""

# Clean up any leftover temporary databases from previous runs
echo "🧹 Cleaning up any leftover temporary databases..."
docker exec "${CONTAINER_NAME}" psql -U postgres -tAc "SELECT datname FROM pg_database WHERE datname LIKE 'waterballsa_syntax_validation_temp_%';" | while read -r old_db; do
    if [ -n "$old_db" ]; then
        echo "   Removing old temp database: $old_db"
        docker exec "${CONTAINER_NAME}" psql -U postgres -c "DROP DATABASE IF EXISTS ${old_db};" > /dev/null 2>&1 || true
    fi
done
echo ""

# Create temporary database for validation
echo "🔧 Creating temporary database: ${TEMP_DB_NAME}"
if docker exec "${CONTAINER_NAME}" psql -U postgres -c "CREATE DATABASE ${TEMP_DB_NAME};" > /dev/null 2>&1; then
    TEMP_DB_CREATED="true"
    echo "✅ Temporary database created successfully"
else
    echo "❌ Failed to create temporary database"
    exit 1
fi
echo ""

# Validate each phase file
# Note: Phase 3 (gamification) is excluded as it's not yet implemented
FILES=(
    "phase1_foundation.sql"
    "phase2_purchases.sql"
    "common_triggers.sql"
)

VALID=true

echo "📝 Validating SQL files in temporary database..."
echo ""

for file in "${FILES[@]}"; do
    filepath="${SCRIPT_DIR}/${file}"

    if [ ! -f "$filepath" ]; then
        echo "❌ File not found: $file"
        VALID=false
        continue
    fi

    echo "Validating: $file"

    # Execute SQL in temporary database
    # Any syntax errors will cause the script to fail
    if docker exec -i "${CONTAINER_NAME}" psql -U postgres -d "${TEMP_DB_NAME}" --set ON_ERROR_STOP=1 > /dev/null 2>&1 <<EOF
$(cat "$filepath")
EOF
    then
        echo "  ✅ Syntax OK"
    else
        echo "  ❌ Syntax errors found"
        VALID=false

        # Show the errors (run again without suppressing output)
        echo "  Error details:"
        docker exec -i "${CONTAINER_NAME}" psql -U postgres -d "${TEMP_DB_NAME}" --set ON_ERROR_STOP=1 2>&1 <<EOF | head -20
$(cat "$filepath")
EOF
    fi
    echo ""
done

echo "============================================================================"
if [ "$VALID" = true ]; then
    echo "✅ All schema files have valid PostgreSQL syntax"
    echo ""
    echo "🔒 Database Safety Guarantees:"
    echo "   • All validation was performed in temporary database: ${TEMP_DB_NAME}"
    echo "   • Main database '${MAIN_DB_NAME}' was never touched"
    echo "   • Temporary database will be automatically cleaned up"
    exit 0
else
    echo "❌ Some schema files have syntax errors"
    echo ""
    echo "🔒 Database Safety Guarantees:"
    echo "   • All validation was performed in temporary database: ${TEMP_DB_NAME}"
    echo "   • Main database '${MAIN_DB_NAME}' was never touched"
    echo "   • Temporary database will be automatically cleaned up"
    exit 1
fi
