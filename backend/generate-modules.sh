#!/bin/bash

# Script to generate NestJS modules efficiently
# Usage: ./generate-modules.sh

cd /opt/sikancil/backend

# Array of modules to generate
# Format: "module-name:entity-name"
modules=(
  "pegawai:Pegawai"
  "supplier:Supplier"
  "bank-account:BankAccount"
  "fiscal-year:FiscalYear"
)

for module_info in "${modules[@]}"; do
  IFS=':' read -r module_name entity_name <<< "$module_info"

  echo "=== Generating ${module_name} module ==="

  # Generate module structure
  npx @nestjs/cli g module modules/${module_name} --no-spec
  npx @nestjs/cli g service modules/${module_name} --no-spec
  npx @nestjs/cli g controller modules/${module_name} --no-spec

  # Create DTO directory
  mkdir -p src/modules/${module_name}/dto

  echo "✓ ${module_name} module structure created"
done

echo ""
echo "=== All modules generated successfully ==="
echo "Next steps:"
echo "1. Implement DTOs for each module"
echo "2. Implement Services with business logic"
echo "3. Implement Controllers with REST endpoints"
echo "4. Update each module to import TypeORM entity"
