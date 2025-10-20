#!/bin/bash

# Colors
info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m  $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()   { echo -e "\033[1;31m[ERR]\033[0m  $*"; }

BASE_URL="http://localhost:3000"

# Extract JSON field value
extract() {
  local json="$1"
  local field="$2"
  echo "$json" | grep -o "\"$field\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)".*/\1/'
}

echo ""
info "Creating sample lesson and questions..."

# Create Lesson 1
LESSON1_PAYLOAD='{
  "lessonNumber": 1,
  "title": "Basic Greetings",
  "description": "Learn basic English greetings",
  "level": "beginner",
  "grammarFocus": "Present Simple",
  "vocabularyFocus": ["Greetings", "Introductions"],
  "isActive": true
}'

info "Creating Lesson 1..."
LESSON1_RESPONSE=$(curl -s -X POST "$BASE_URL/english-course/lessons" \
  -H "Content-Type: application/json" \
  -d "$LESSON1_PAYLOAD")

info "Lesson 1 Response: $LESSON1_RESPONSE"
LESSON1_ID=$(extract "$LESSON1_RESPONSE" "id")
info "Lesson 1 ID: $LESSON1_ID"

# Create Questions for Lesson 1
info "Creating questions for Lesson 1..."

# Question 1
QUESTION1_PAYLOAD='{
  "questionText": "How do you say hello in English?",
  "expectedAnswer": "Hello",
  "alternativeAnswer": "Hi",
  "grammarPoint": "Greetings",
  "audioUrl": "https://example.com/hello.mp3",
  "lessonId": "'$LESSON1_ID'"
}'

curl -s -X POST "$BASE_URL/english-course/questions" \
  -H "Content-Type: application/json" \
  -d "$QUESTION1_PAYLOAD" > /dev/null

# Question 2
QUESTION2_PAYLOAD='{
  "questionText": "What is the formal way to greet someone?",
  "expectedAnswer": "Good morning",
  "alternativeAnswer": "Good afternoon",
  "grammarPoint": "Formal greetings",
  "audioUrl": "https://example.com/good-morning.mp3",
  "lessonId": "'$LESSON1_ID'"
}'

curl -s -X POST "$BASE_URL/english-course/questions" \
  -H "Content-Type: application/json" \
  -d "$QUESTION2_PAYLOAD" > /dev/null

# Question 3
QUESTION3_PAYLOAD='{
  "questionText": "How do you say goodbye?",
  "expectedAnswer": "Goodbye",
  "alternativeAnswer": "Bye",
  "grammarPoint": "Farewells",
  "audioUrl": "https://example.com/goodbye.mp3",
  "lessonId": "'$LESSON1_ID'"
}'

curl -s -X POST "$BASE_URL/english-course/questions" \
  -H "Content-Type: application/json" \
  -d "$QUESTION3_PAYLOAD" > /dev/null

# Create Lesson 2
LESSON2_PAYLOAD='{
  "lessonNumber": 2,
  "title": "Numbers 1-10",
  "description": "Learn numbers from 1 to 10",
  "level": "beginner",
  "grammarFocus": "Cardinal numbers",
  "vocabularyFocus": ["Numbers", "Counting"],
  "isActive": true
}'

info "Creating Lesson 2..."
LESSON2_RESPONSE=$(curl -s -X POST "$BASE_URL/english-course/lessons" \
  -H "Content-Type: application/json" \
  -d "$LESSON2_PAYLOAD")

LESSON2_ID=$(extract "$LESSON2_RESPONSE" "id")
info "Lesson 2 ID: $LESSON2_ID"

# Create Questions for Lesson 2
info "Creating questions for Lesson 2..."

# Question 4
QUESTION4_PAYLOAD='{
  "questionText": "What number comes after 5?",
  "expectedAnswer": "6",
  "alternativeAnswer": "Six",
  "grammarPoint": "Cardinal numbers",
  "audioUrl": "https://example.com/six.mp3",
  "lessonId": "'$LESSON2_ID'"
}'

curl -s -X POST "$BASE_URL/english-course/questions" \
  -H "Content-Type: application/json" \
  -d "$QUESTION4_PAYLOAD" > /dev/null

# Question 5
QUESTION5_PAYLOAD='{
  "questionText": "How do you say 10 in English?",
  "expectedAnswer": "Ten",
  "alternativeAnswer": "10",
  "grammarPoint": "Cardinal numbers",
  "audioUrl": "https://example.com/ten.mp3",
  "lessonId": "'$LESSON2_ID'"
}'

curl -s -X POST "$BASE_URL/english-course/questions" \
  -H "Content-Type: application/json" \
  -d "$QUESTION5_PAYLOAD" > /dev/null

ok "Sample data created successfully!"
ok "Created 2 lessons with 5 questions total"
