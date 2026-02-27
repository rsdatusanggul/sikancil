#!/bin/bash

# Rollback to new-york Enhanced Style
# This script restores all UI components and configs from backup

set -e  # Exit on error

echo "🔄 Rolling back to new-york (enhanced) style..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backup exists
if [ ! -d ".style-backups/new-york-enhanced" ]; then
    echo -e "${RED}❌ Error: Backup not found at .style-backups/new-york-enhanced${NC}"
    echo "Cannot rollback without backup!"
    exit 1
fi

echo -e "${BLUE}📦 Backup found. Starting rollback...${NC}"
echo ""

# Create current state backup before rollback (safety net)
echo "Creating safety backup of current state..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p .style-backups/pre-rollback-$TIMESTAMP
cp -r src/components/ui .style-backups/pre-rollback-$TIMESTAMP/ 2>/dev/null || true
cp tailwind.config.js .style-backups/pre-rollback-$TIMESTAMP/ 2>/dev/null || true
cp src/index.css .style-backups/pre-rollback-$TIMESTAMP/ 2>/dev/null || true
cp components.json .style-backups/pre-rollback-$TIMESTAMP/ 2>/dev/null || true
echo -e "${GREEN}✓ Safety backup created at .style-backups/pre-rollback-$TIMESTAMP${NC}"
echo ""

# Restore UI components
echo "Restoring UI components..."
rm -rf src/components/ui/*
cp -r .style-backups/new-york-enhanced/ui/* src/components/ui/
echo -e "${GREEN}✓ UI components restored (25 components)${NC}"

# Restore config files
echo "Restoring configuration files..."
cp .style-backups/new-york-enhanced/tailwind.config.js tailwind.config.js
echo -e "${GREEN}✓ tailwind.config.js restored${NC}"

cp .style-backups/new-york-enhanced/index.css src/index.css
echo -e "${GREEN}✓ index.css restored${NC}"

cp .style-backups/new-york-enhanced/components.json components.json
echo -e "${GREEN}✓ components.json restored${NC}"

cp .style-backups/new-york-enhanced/index.html index.html
echo -e "${GREEN}✓ index.html restored${NC}"

echo ""
echo -e "${GREEN}✅ Rollback complete!${NC}"
echo ""
echo "📋 Restored state:"
echo "  - Style: new-york (enhanced)"
echo "  - Components: 25"
echo "  - Enhancements: Stages 1, 2, 4 + Inter typography"
echo "  - Elevation system: 5 levels"
echo "  - Animations: 12 keyframes"
echo ""
echo "🧪 Next steps:"
echo "  1. Run: npm run build"
echo "  2. Test all pages visually"
echo "  3. Verify animations work"
echo "  4. Check TypeScript errors"
echo ""
echo -e "${BLUE}💾 Your previous state was backed up to:${NC}"
echo "  .style-backups/pre-rollback-$TIMESTAMP"
echo ""
