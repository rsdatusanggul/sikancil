#!/bin/bash

# Switch to "default" shadcn style (EXPERIMENTAL)
# ⚠️ WARNING: This will regenerate components and lose custom enhancements!

set -e  # Exit on error

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}⚠️  WARNING: EXPERIMENTAL STYLE SWITCH${NC}"
echo ""
echo "This script will:"
echo "  1. Change components.json to 'default' style"
echo "  2. Create backup of current state"
echo "  3. Provide manual regeneration instructions"
echo ""
echo -e "${YELLOW}You will LOSE:${NC}"
echo "  - All Stage 1-4 custom enhancements"
echo "  - Custom elevation variants"
echo "  - Animation enhancements"
echo "  - Focus color transitions"
echo "  - Error shake animations"
echo "  - Shimmer effects"
echo ""
echo -e "${GREEN}You can rollback with:${NC}"
echo "  ./scripts/rollback-to-newyork.sh"
echo ""

# Confirmation
read -p "Are you SURE you want to proceed? (type 'yes' to continue): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled. No changes made."
    exit 0
fi

echo ""
echo -e "${BLUE}Creating backup before switch...${NC}"

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p .style-backups/before-default-switch-$TIMESTAMP
cp -r src/components/ui .style-backups/before-default-switch-$TIMESTAMP/
cp tailwind.config.js .style-backups/before-default-switch-$TIMESTAMP/
cp src/index.css .style-backups/before-default-switch-$TIMESTAMP/
cp components.json .style-backups/before-default-switch-$TIMESTAMP/
cp index.html .style-backups/before-default-switch-$TIMESTAMP/

echo -e "${GREEN}✓ Backup created at .style-backups/before-default-switch-$TIMESTAMP${NC}"
echo ""

# Update components.json
echo "Updating components.json to 'default' style..."
cat > components.json << 'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
EOF

echo -e "${GREEN}✓ components.json updated to 'default' style${NC}"
echo ""

echo -e "${YELLOW}⚠️  MANUAL STEPS REQUIRED:${NC}"
echo ""
echo "To complete the switch, regenerate components manually:"
echo ""
echo "# Core components:"
echo "npx shadcn-ui@latest add button --overwrite"
echo "npx shadcn-ui@latest add input --overwrite"
echo "npx shadcn-ui@latest add card --overwrite"
echo "npx shadcn-ui@latest add table --overwrite"
echo "npx shadcn-ui@latest add label --overwrite"
echo "npx shadcn-ui@latest add textarea --overwrite"
echo "npx shadcn-ui@latest add alert --overwrite"
echo "npx shadcn-ui@latest add badge --overwrite"
echo ""
echo "# Shadcn components:"
echo "npx shadcn-ui@latest add dialog --overwrite"
echo "npx shadcn-ui@latest add dropdown-menu --overwrite"
echo "npx shadcn-ui@latest add popover --overwrite"
echo "npx shadcn-ui@latest add tooltip --overwrite"
echo "npx shadcn-ui@latest add select --overwrite"
echo "npx shadcn-ui@latest add checkbox --overwrite"
echo "npx shadcn-ui@latest add radio-group --overwrite"
echo "npx shadcn-ui@latest add tabs --overwrite"
echo "npx shadcn-ui@latest add avatar --overwrite"
echo "npx shadcn-ui@latest add separator --overwrite"
echo "npx shadcn-ui@latest add sonner --overwrite"
echo ""
echo -e "${GREEN}⚠️  DO NOT REGENERATE:${NC}"
echo "  - CurrencyInput (custom component)"
echo "  - LoadingSpinner (custom component)"
echo "  - LoadingOverlay (custom component)"
echo "  - Modal (custom wrapper)"
echo "  - SimpleSelect (custom wrapper)"
echo "  - Skeleton (keep enhanced version or manually add shimmer after regenerating)"
echo ""
echo -e "${BLUE}After regeneration:${NC}"
echo "  1. Run: npm run build"
echo "  2. Fix TypeScript errors"
echo "  3. Test all pages"
echo "  4. If unsatisfied, rollback: ./scripts/rollback-to-newyork.sh"
echo ""
echo -e "${RED}REMEMBER: All custom enhancements will be lost!${NC}"
echo "You'll need to manually reapply Stage 1-4 changes if you want them in 'default' style."
echo ""
