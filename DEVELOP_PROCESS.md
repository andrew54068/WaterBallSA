# 🚀 Development Process Guide

This document outlines the workflow for setting up the environment, generating SDD (Spec-Driven Development) artifacts, and verifying the WaterBallsa backend implementation.

## 🛠 Prerequisites

Before starting, ensure you have the core dependencies ready:
1. **Clone the `sdd.os` repository** to your local machine.
2. **Install dependencies** within the `sdd.os` project.
3. Feature files are stored in the `backend/src/test/resources/features` directory.

## 📂 Key Specification Files

The system architecture is defined by the following spec files in the `backend/` directory:

| Type | Path | Description |
|------|------|-------------|
| **API Spec** | `spec/api/api-spec.yml` | REST API definitions |
| **Mapping** | `spec/data/entity_to_table_mapping.yml` | Object-Relational mapping |
| **Schema** | `spec/data/schema.sql` | Database schema definitions |
| **Entities** | `spec/entities/*.yml` | Domain entity definitions |

## ⚡️ SDD Generation Workflow

Follow these steps to generate the necessary code and configuration.

### 1. Configure Local Environment
Navigate to the backend directory and initialize your configuration:

```bash
cd backend
cp isa.properties.example isa.properties
```

**Action Required**: Edit `isa.properties` and set `SDD_OS_PATH` to your local `sdd.os` source directory:
```properties
SDD_OS_PATH=~/your-path/sdd.os/src
```

### 2. Generate Artifacts
Run the assembler script to generate the `isa_codegen.yml` and other artifacts:

```bash
./assembler_codegen.sh
```

### 3. Linting
Return to the project root and run the ISA linter to ensure spec compliance:

```bash
cd ..
./run-isa-lint.sh
```

## 🤖 AI-Assisted Implementation

We use AI to accelerate development.
- **Prompt File**: `backend/prompt.md`
- Use this prompt to guide the AI in implementing the business logic based on the generated specs.

## ✅ Verification

Verify the implementation using the Dockerized test environment to ensure consistency:

```bash
docker build -t backend-test -f backend/Dockerfile.dev backend && \
docker run --rm backend-test mvn test
```