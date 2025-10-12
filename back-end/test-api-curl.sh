#!/bin/bash

# ScaleX API Testing Script with cURL
# Make sure the backend is running on http://localhost:3000

BASE_URL="http://localhost:3000"
USERS_ENDPOINT="$BASE_URL/users"

echo "🚀 Starting ScaleX API Tests..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_test() {
    echo -e "${BLUE}📋 Test: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ Success: $1${NC}"
}

print_error() {
    echo -e "${RED}❌ Error: $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  Info: $1${NC}"
}

# ===========================================
# 1. USER MANAGEMENT TESTS
# ===========================================

echo ""
print_test "1. USER MANAGEMENT TESTS"
echo "=============================="

# 1.1 Create a new user
print_test "Creating a new user..."
USER_RESPONSE=$(curl -s -X POST "$USERS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_123",
    "email": "testuser@example.com",
    "full_name": "John Doe",
    "birth_date": "1990-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }')

if [ $? -eq 0 ]; then
    print_success "User created successfully"
    echo "$USER_RESPONSE" | jq '.' 2>/dev/null || echo "$USER_RESPONSE"
    
    # Extract user ID for further tests
    USER_ID=$(echo "$USER_RESPONSE" | jq -r '.id' 2>/dev/null)
    if [ "$USER_ID" != "null" ] && [ "$USER_ID" != "" ]; then
        print_info "User ID: $USER_ID"
    else
        print_error "Could not extract user ID from response"
        exit 1
    fi
else
    print_error "Failed to create user"
    echo "$USER_RESPONSE"
    exit 1
fi

# 1.2 Get all users
print_test "Getting all users..."
curl -s -X GET "$USERS_ENDPOINT" | jq '.' 2>/dev/null || curl -s -X GET "$USERS_ENDPOINT"

# 1.3 Get user by ID
print_test "Getting user by ID: $USER_ID"
curl -s -X GET "$USERS_ENDPOINT/$USER_ID" | jq '.' 2>/dev/null || curl -s -X GET "$USERS_ENDPOINT/$USER_ID"

# 1.4 Get user by Firebase UID
print_test "Getting user by Firebase UID..."
curl -s -X GET "$USERS_ENDPOINT/firebase/test_firebase_uid_123" | jq '.' 2>/dev/null || curl -s -X GET "$USERS_ENDPOINT/firebase/test_firebase_uid_123"

# 1.5 Get user by email
print_test "Getting user by email..."
curl -s -X GET "$USERS_ENDPOINT/email?email=testuser@example.com" | jq '.' 2>/dev/null || curl -s -X GET "$USERS_ENDPOINT/email?email=testuser@example.com"

# 1.6 Update user
print_test "Updating user..."
curl -s -X PATCH "$USERS_ENDPOINT/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Smith",
    "phone": "+1-555-987-6543",
    "preferred_language": "pt-BR"
  }' | jq '.' 2>/dev/null || curl -s -X PATCH "$USERS_ENDPOINT/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Smith",
    "phone": "+1-555-987-6543",
    "preferred_language": "pt-BR"
  }'

# ===========================================
# 2. ADDRESS MANAGEMENT TESTS
# ===========================================

echo ""
print_test "2. ADDRESS MANAGEMENT TESTS"
echo "================================="

# 2.1 Create first address (primary)
print_test "Creating primary address..."
ADDRESS1_RESPONSE=$(curl -s -X POST "$USERS_ENDPOINT/$USER_ID/addresses" \
  -H "Content-Type: application/json" \
  -d '{
    "address_type": "primary",
    "street": "123 Main Street",
    "number": "Apt 4B",
    "complement": "Building A",
    "neighborhood": "Downtown",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States",
    "is_primary": true
  }')

if [ $? -eq 0 ]; then
    print_success "Primary address created successfully"
    echo "$ADDRESS1_RESPONSE" | jq '.' 2>/dev/null || echo "$ADDRESS1_RESPONSE"
    
    # Extract address ID
    ADDRESS1_ID=$(echo "$ADDRESS1_RESPONSE" | jq -r '.id' 2>/dev/null)
    if [ "$ADDRESS1_ID" != "null" ] && [ "$ADDRESS1_ID" != "" ]; then
        print_info "Address 1 ID: $ADDRESS1_ID"
    fi
else
    print_error "Failed to create primary address"
    echo "$ADDRESS1_RESPONSE"
fi

# 2.2 Create second address (billing)
print_test "Creating billing address..."
ADDRESS2_RESPONSE=$(curl -s -X POST "$USERS_ENDPOINT/$USER_ID/addresses" \
  -H "Content-Type: application/json" \
  -d '{
    "address_type": "billing",
    "street": "456 Business Ave",
    "number": "Suite 200",
    "neighborhood": "Financial District",
    "city": "New York",
    "state": "NY",
    "postal_code": "10005",
    "country": "United States",
    "is_primary": false
  }')

if [ $? -eq 0 ]; then
    print_success "Billing address created successfully"
    echo "$ADDRESS2_RESPONSE" | jq '.' 2>/dev/null || echo "$ADDRESS2_RESPONSE"
    
    # Extract address ID
    ADDRESS2_ID=$(echo "$ADDRESS2_RESPONSE" | jq -r '.id' 2>/dev/null)
    if [ "$ADDRESS2_ID" != "null" ] && [ "$ADDRESS2_ID" != "" ]; then
        print_info "Address 2 ID: $ADDRESS2_ID"
    fi
else
    print_error "Failed to create billing address"
    echo "$ADDRESS2_RESPONSE"
fi

# 2.3 Create third address (shipping)
print_test "Creating shipping address..."
ADDRESS3_RESPONSE=$(curl -s -X POST "$USERS_ENDPOINT/$USER_ID/addresses" \
  -H "Content-Type: application/json" \
  -d '{
    "address_type": "shipping",
    "street": "789 Warehouse Blvd",
    "number": "Unit 15",
    "neighborhood": "Industrial Zone",
    "city": "Brooklyn",
    "state": "NY",
    "postal_code": "11201",
    "country": "United States",
    "is_primary": false
  }')

if [ $? -eq 0 ]; then
    print_success "Shipping address created successfully"
    echo "$ADDRESS3_RESPONSE" | jq '.' 2>/dev/null || echo "$ADDRESS3_RESPONSE"
    
    # Extract address ID
    ADDRESS3_ID=$(echo "$ADDRESS3_RESPONSE" | jq -r '.id' 2>/dev/null)
    if [ "$ADDRESS3_ID" != "null" ] && [ "$ADDRESS3_ID" != "" ]; then
        print_info "Address 3 ID: $ADDRESS3_ID"
    fi
else
    print_error "Failed to create shipping address"
    echo "$ADDRESS3_RESPONSE"
fi

# 2.4 Get all addresses for user
print_test "Getting all addresses for user..."
curl -s -X GET "$USERS_ENDPOINT/$USER_ID/addresses" | jq '.' 2>/dev/null || curl -s -X GET "$USERS_ENDPOINT/$USER_ID/addresses"

# 2.5 Update first address (make it non-primary)
print_test "Updating first address (making it non-primary)..."
if [ ! -z "$ADDRESS1_ID" ]; then
    curl -s -X PATCH "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS1_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "is_primary": false,
        "complement": "Updated Building A"
      }' | jq '.' 2>/dev/null || curl -s -X PATCH "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS1_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "is_primary": false,
        "complement": "Updated Building A"
      }'
fi

# 2.6 Update second address (make it primary)
print_test "Updating second address (making it primary)..."
if [ ! -z "$ADDRESS2_ID" ]; then
    curl -s -X PATCH "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS2_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "is_primary": true,
        "address_type": "primary",
        "street": "456 Updated Business Ave"
      }' | jq '.' 2>/dev/null || curl -s -X PATCH "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS2_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "is_primary": true,
        "address_type": "primary",
        "street": "456 Updated Business Ave"
      }'
fi

# 2.7 Get updated addresses
print_test "Getting updated addresses..."
curl -s -X GET "$USERS_ENDPOINT/$USER_ID/addresses" | jq '.' 2>/dev/null || curl -s -X GET "$USERS_ENDPOINT/$USER_ID/addresses"

# ===========================================
# 3. ERROR HANDLING TESTS
# ===========================================

echo ""
print_test "3. ERROR HANDLING TESTS"
echo "============================"

# 3.1 Try to create user with invalid email
print_test "Testing invalid email validation..."
curl -s -X POST "$USERS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_invalid",
    "email": "invalid-email",
    "full_name": "Invalid User",
    "birth_date": "1990-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }' | jq '.' 2>/dev/null || curl -s -X POST "$USERS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_invalid",
    "email": "invalid-email",
    "full_name": "Invalid User",
    "birth_date": "1990-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }'

# 3.2 Try to create user with future birth date
print_test "Testing future birth date validation..."
curl -s -X POST "$USERS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_future",
    "email": "future@example.com",
    "full_name": "Future User",
    "birth_date": "2030-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }' | jq '.' 2>/dev/null || curl -s -X POST "$USERS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_future",
    "email": "future@example.com",
    "full_name": "Future User",
    "birth_date": "2030-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }'

# 3.3 Try to create address with invalid address type
print_test "Testing invalid address type validation..."
if [ ! -z "$USER_ID" ]; then
    curl -s -X POST "$USERS_ENDPOINT/$USER_ID/addresses" \
      -H "Content-Type: application/json" \
      -d '{
        "address_type": "invalid_type",
        "street": "123 Test Street",
        "postal_code": "12345",
        "country": "Test Country"
      }' | jq '.' 2>/dev/null || curl -s -X POST "$USERS_ENDPOINT/$USER_ID/addresses" \
      -H "Content-Type: application/json" \
      -d '{
        "address_type": "invalid_type",
        "street": "123 Test Street",
        "postal_code": "12345",
        "country": "Test Country"
      }'
fi

# ===========================================
# 4. CLEANUP (Optional)
# ===========================================

echo ""
print_test "4. CLEANUP (Optional)"
echo "========================"

# Uncomment the following lines if you want to clean up test data
# print_test "Deleting test addresses..."
# if [ ! -z "$ADDRESS1_ID" ]; then
#     curl -s -X DELETE "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS1_ID"
# fi
# if [ ! -z "$ADDRESS2_ID" ]; then
#     curl -s -X DELETE "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS2_ID"
# fi
# if [ ! -z "$ADDRESS3_ID" ]; then
#     curl -s -X DELETE "$USERS_ENDPOINT/$USER_ID/addresses/$ADDRESS3_ID"
# fi

# print_test "Deleting test user..."
# if [ ! -z "$USER_ID" ]; then
#     curl -s -X DELETE "$USERS_ENDPOINT/$USER_ID"
# fi

echo ""
print_success "🎉 All tests completed!"
echo "=================================="
print_info "Note: Make sure your backend is running on http://localhost:3000"
print_info "Note: Install jq for better JSON formatting: https://stedolan.github.io/jq/"
