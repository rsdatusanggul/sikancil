#!/bin/bash
cd /opt/sikancil/backend

modules=(
  "program-rba"
  "kegiatan-rba"
  "output-rba"
  "sub-output-rba"
  "anggaran-belanja-rba"
  "anggaran-kas"
  "revisi-rba"
)

for module in "${modules[@]}"; do
  echo "=== Generating ${module} module ==="
  npx @nestjs/cli g module modules/${module} --no-spec
  npx @nestjs/cli g service modules/${module} --no-spec
  npx @nestjs/cli g controller modules/${module} --no-spec
  mkdir -p src/modules/${module}/dto
  echo "✓ ${module} module structure created"
done

echo "✓ All RBA modules generated"
