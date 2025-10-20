#!/usr/bin/env bash

# English Course E2E API script
# Requires backend running at http://localhost:3000 and postgres via docker-compose

set -euo pipefail

BASE_URL="http://localhost:3000"

info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m  $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()   { echo -e "\033[1;31m[ERR]\033[0m  $*"; }

# Script works without jq using grep/sed for JSON parsing
JQ="cat"

req() {
  local method="$1"; shift
  local endpoint="$1"; shift
  local body="${1:-}"; shift || true
  if [[ -n "$body" ]]; then
    curl -s -X "$method" "$BASE_URL$endpoint" -H 'Content-Type: application/json' -d "$body"
  else
    curl -s -X "$method" "$BASE_URL$endpoint"
  fi
}

extract() {
  local json="$1"
  local field="$2"
  # Extract value using grep and sed (works without jq)
  echo "$json" | grep -o "\"$field\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)".*/\1/'
}

echo ""
info "Creating or fetching test user"
USER_EMAIL="testuser+e2e@example.com"
USER_CREATE_PAYLOAD=$(cat <<JSON
{
  "firebase_uid": "test_firebase_uid_e2e",
  "email": "$USER_EMAIL",
  "full_name": "E2E Tester",
  "birth_date": "1990-01-01",
  "phone": "+55 11 99999-9999",
  "preferred_language": "pt-BR"
}
JSON
)

# Prefer lookup by Firebase UID to avoid URL-encoding issues
info "Looking up user by Firebase UID..."
USER_GET=$(req GET "/users/firebase/test_firebase_uid_e2e") || true
info "User response: $USER_GET"
USER_ID="$(extract "$USER_GET" "id")"
info "Extracted USER_ID: $USER_ID"
if [[ -z "$USER_ID" || "$USER_ID" == "null" ]]; then
  info "User not found, creating new user..."
  USER_POST=$(req POST "/users" "$USER_CREATE_PAYLOAD")
  info "User creation response: $USER_POST"
  USER_ID="$(extract "$USER_POST" "id")"
  info "New USER_ID: $USER_ID"
fi
[[ -n "$USER_ID" && "$USER_ID" != "null" ]] || { err "Could not obtain USER_ID"; exit 1; }
ok "USER_ID: $USER_ID"

echo ""
info "Fetching a lesson to test"
LESSONS=$(req GET "/english-course/lessons")
info "Lessons response: $LESSONS"
# Extract first lesson ID from array
LESSON_ID=$(echo "$LESSONS" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
if [[ -z "$LESSON_ID" || "$LESSON_ID" == "null" ]]; then
  err "No lessons found. Seed sample data first (english-course-sample-data-fixed.sql)."
  exit 1
fi
ok "LESSON_ID: $LESSON_ID"

echo ""
info "Create initial reviews for the lesson"
req POST "/english-course/users/$USER_ID/lessons/$LESSON_ID/create-reviews"

echo ""
info "Mark reviews as due"
req POST "/english-course/reviews/mark-due" 
echo ""
info "Get due reviews (lesson-scoped)"
DUE=$(req GET "/english-course/users/$USER_ID/lessons/$LESSON_ID/reviews/due?limit=10")
echo "$DUE"

REV_FIRST_QID=$(echo "$DUE" | grep -o '"questionId":"[^"]*"' | head -1 | sed 's/"questionId":"\([^"]*\)"/\1/')
[[ -n "$REV_FIRST_QID" && "$REV_FIRST_QID" != "null" ]] || { err "No due reviews returned"; exit 1; }
ok "First Question ID: $REV_FIRST_QID"

do_submit() {
  local diff="$1"
  info "Submit difficulty: $diff"
  BODY=$(printf '{"difficulty":"%s"}' "$diff")
  req POST "/english-course/users/$USER_ID/lessons/$LESSON_ID/questions/$REV_FIRST_QID/difficulty" "$BODY"
}

echo ""
info "Submitting Again → should schedule in ~1 min"
do_submit "again"

echo ""
info "Submitting Hard (first) → should schedule in ~10 min"
do_submit "hard"

echo ""
info "Mark reviews as due again and fetch"
req POST "/english-course/reviews/mark-due"
DUE2=$(req GET "/english-course/users/$USER_ID/reviews/due?limit=10")
echo "$DUE2"

echo ""
ok "E2E script completed. Verify srsCandidateLabels/Values and nextReviewDate outputs above."


