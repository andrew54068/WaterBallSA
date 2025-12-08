#!/bin/bash


# Default values
LOG_LEVEL="INFO"
FEATURE_PATH="src/test/resources/features"
ISA_PROPERTIES="isa.properties"
ISA_TEMPLATE="isa_codegen.yml.template"
ISA_RESOLVED="isa_codegen.yml"

# Ensure we are in the script directory
cd "$(dirname "$0")" || exit


# Parse arguments
while [ $# -gt 0 ]; do
  case $1 in
    --log-level)
      LOG_LEVEL="$2"
      shift 2
      ;;
    --feature)
      FEATURE_PATH="$2"
      shift 2
      ;;
    *)
      echo "Error: Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ ! -z "$FEATURE_PATH" ]; then
  case "$FEATURE_PATH" in
    /*) ;;
    *) FEATURE_PATH="$(pwd)/$FEATURE_PATH" ;;
  esac
fi

# Resolve SDD_OS_PATH
SDD_OS_PATH="../../../src"
if [ -f "$ISA_PROPERTIES" ]; then
  # Read property from file, ignoring comments and whitespace
  PROP_VAL=$(grep -v '^#' "$ISA_PROPERTIES" | grep "SDD_OS_PATH" | cut -d'=' -f2 | tr -d '[:space:]')
  if [ ! -z "$PROP_VAL" ]; then
    SDD_OS_PATH="$PROP_VAL"
  fi
fi

# Expand tilde (~/...) to $HOME if present
if [[ "$SDD_OS_PATH" == ~* ]]; then
  SDD_OS_PATH="${SDD_OS_PATH/#\~/$HOME}"
fi

echo "Using SDD_OS_PATH: $SDD_OS_PATH"

# Generate resolved YAML
sed "s|{{SDD_OS_PATH}}|$SDD_OS_PATH|g" "$ISA_TEMPLATE" > "$ISA_RESOLVED"

export PYTHONPATH=${SDD_OS_PATH}

# Check if we're in a virtual environment, otherwise try to find and use venv
if [ -z "$VIRTUAL_ENV" ] && [ -f "${SDD_OS_PATH}/../.venv/bin/python" ]; then
  PYTHON_CMD="${SDD_OS_PATH}/../.venv/bin/python"
else
  PYTHON_CMD="python3"
fi
echo "DEBUG: Listing entity specs in $(pwd)/spec/entities"
ls -l "$(pwd)/spec/entities"

echo "Using PYTHON_CMD: $PYTHON_CMD"

$PYTHON_CMD -m gherkin_spec.gherkin_runner \
  -d "$FEATURE_PATH" \
  --isa "$ISA_RESOLVED" \
  --log-level $LOG_LEVEL \
  --executor-kwargs \
    app_pkg_path="tw.waterballsa.api" \
    stepdef_pkg_path="stepdefs" \
    authenticator_pkg_path="stepdefs" \
    resolver_pkg_path="stepdefs.helper" \
    repo_subpkg_path="repository" \
    entity_subpkg_path="entity" \
    api_yaml_path="$(pwd)/spec/api/api-spec.yml" \
    entity_mapping_path="$(pwd)/spec/data/entity_to_table_mapping.yml" \
    sql_ddl_path="$(pwd)/spec/data/schema.sql" \
    entity_specs_path="$(pwd)/spec/entities" \
    test_root_path="$(pwd)/src/test/java" \
    api_subpkg="when" \
    step_fake_delay_sec=0