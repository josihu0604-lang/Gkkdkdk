#!/usr/bin/env bash
set -euo pipefail
API="${1:-http://localhost:3000}"
echo "→ Smoke: lead submission"
curl -sS -X POST "$API/api/v1/leads" -H "Content-Type: application/json" \
 -d '{"business_name":"ZZIK","contact_name":"Ops","email":"ops@example.com","phone":"010-0000-0000"}' | jq .
echo "→ Done"
