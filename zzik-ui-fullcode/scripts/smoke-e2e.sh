#!/usr/bin/env bash
set -euo pipefail

API="${1:-http://localhost:3000}"

echo "→ ZZIK Smoke Test: Lead Submission"
echo "→ API: $API"

curl -sS -X POST "$API/api/v1/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "ZZIK Test Corp",
    "contact_name": "Operations",
    "email": "ops@example.com",
    "phone": "010-0000-0000"
  }' | jq . || echo "⚠️ jq not installed, showing raw response"

echo "→ Done"
