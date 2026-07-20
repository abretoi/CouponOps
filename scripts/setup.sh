#!/usr/bin/env bash
# CouponOps clean-install script. Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "── CouponOps setup ──"

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js not found. Install Node 20+ from https://nodejs.org and re-run."
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "✗ Node 20+ required (found $(node -v))."
  exit 1
fi
echo "✓ Node $(node -v)"

npm install --no-fund --no-audit
echo "✓ Dependencies installed"

if [ ! -f data/deals.json ]; then
  node scripts/build-data.js
  echo "✓ Seed dataset generated"
else
  echo "✓ Seed dataset present ($(node -p "JSON.parse(require('fs').readFileSync('data/deals.json')).deals.length") deals)"
fi

if [ ! -f data/config.json ]; then
  printf '{\n  "aiProvider": "anthropic",\n  "aiModel": "claude-fable-5",\n  "aiKeys": {}\n}\n' > data/config.json
  echo "✓ Blank config created (add API keys in Settings)"
fi

echo ""
echo "Done. Start with:  npm start   →  http://localhost:4747"
