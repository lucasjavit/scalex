# ScaleX API Testing with cURL

Make sure your backend is running on `http://localhost:3000` before running these commands.

## 1. USER MANAGEMENT

### 1.1 Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_123",
    "email": "testuser@example.com",
    "full_name": "John Doe",
    "birth_date": "1990-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }'
```

### 1.2 Get All Users
```bash
curl -X GET http://localhost:3000/users
```

### 1.3 Get User by ID (replace USER_ID with actual ID from create response)
```bash
curl -X GET http://localhost:3000/users/USER_ID
```

### 1.4 Get User by Firebase UID
```bash
curl -X GET http://localhost:3000/users/firebase/test_firebase_uid_123
```

### 1.5 Get User by Email
```bash
curl -X GET "http://localhost:3000/users/email?email=testuser@example.com"
```

### 1.6 Update User (replace USER_ID with actual ID)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Smith",
    "phone": "+1-555-987-6543",
    "preferred_language": "pt-BR"
  }'
```

### 1.7 Delete User (replace USER_ID with actual ID)
```bash
curl -X DELETE http://localhost:3000/users/USER_ID
```

## 2. ADDRESS MANAGEMENT

### 2.1 Create Primary Address (replace USER_ID with actual ID)
```bash
curl -X POST http://localhost:3000/users/USER_ID/addresses \
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
  }'
```

### 2.2 Create Billing Address (replace USER_ID with actual ID)
```bash
curl -X POST http://localhost:3000/users/USER_ID/addresses \
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
  }'
```

### 2.3 Create Shipping Address (replace USER_ID with actual ID)
```bash
curl -X POST http://localhost:3000/users/USER_ID/addresses \
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
  }'
```

### 2.4 Get All Addresses for User (replace USER_ID with actual ID)
```bash
curl -X GET http://localhost:3000/users/USER_ID/addresses
```

### 2.5 Update Address (replace USER_ID and ADDRESS_ID with actual IDs)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID/addresses/ADDRESS_ID \
  -H "Content-Type: application/json" \
  -d '{
    "is_primary": true,
    "address_type": "primary",
    "street": "456 Updated Business Ave"
  }'
```

### 2.6 Delete Address (replace USER_ID and ADDRESS_ID with actual IDs)
```bash
curl -X DELETE http://localhost:3000/users/USER_ID/addresses/ADDRESS_ID
```

## 3. ERROR HANDLING TESTS

### 3.1 Test Invalid Email Validation
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_invalid",
    "email": "invalid-email",
    "full_name": "Invalid User",
    "birth_date": "1990-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }'
```

### 3.2 Test Future Birth Date Validation
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid_future",
    "email": "future@example.com",
    "full_name": "Future User",
    "birth_date": "2030-05-15",
    "phone": "+1-555-123-4567",
    "preferred_language": "en-US"
  }'
```

### 3.3 Test Invalid Address Type (replace USER_ID with actual ID)
```bash
curl -X POST http://localhost:3000/users/USER_ID/addresses \
  -H "Content-Type: application/json" \
  -d '{
    "address_type": "invalid_type",
    "street": "123 Test Street",
    "postal_code": "12345",
    "country": "Test Country"
  }'
```

## 4. QUICK TEST SEQUENCE

Here's a quick sequence to test the main functionality:

1. **Start your backend**: `npm run start:dev`
2. **Create a user** (copy the ID from response):
   ```bash
   curl -X POST http://localhost:3000/users \
     -H "Content-Type: application/json" \
     -d '{
       "firebase_uid": "test_firebase_uid_123",
       "email": "testuser@example.com",
       "full_name": "John Doe",
       "birth_date": "1990-05-15",
       "phone": "+1-555-123-4567",
       "preferred_language": "en-US"
     }'
   ```

3. **Create an address** (replace USER_ID with the ID from step 2):
   ```bash
   curl -X POST http://localhost:3000/users/USER_ID/addresses \
     -H "Content-Type: application/json" \
     -d '{
       "address_type": "primary",
       "street": "123 Main Street",
       "postal_code": "10001",
       "country": "United States",
       "is_primary": true
     }'
   ```

4. **Update the user** (replace USER_ID):
   ```bash
   curl -X PATCH http://localhost:3000/users/USER_ID \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "John Smith Updated"
     }'
   ```

5. **Update the address** (replace USER_ID and ADDRESS_ID):
   ```bash
   curl -X PATCH http://localhost:3000/users/USER_ID/addresses/ADDRESS_ID \
     -H "Content-Type: application/json" \
     -d '{
       "street": "456 Updated Street"
     }'
   ```

## Notes

- Replace `USER_ID` and `ADDRESS_ID` with actual IDs from the API responses
- All timestamps are in ISO format
- The API returns JSON responses
- Use `jq` for better JSON formatting: `curl ... | jq '.'`
- Make sure your database is running (Docker Compose: `docker-compose up -d`)
