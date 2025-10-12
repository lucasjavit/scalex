# ScaleX - Normalized Database Architecture Guide

## Overview

The ScaleX database follows **Third Normal Form (3NF)** best practices to eliminate data redundancy, improve data integrity, and optimize query performance.

## Database Normalization Benefits

✅ **No Data Duplication** - Reference data (countries, states, languages) stored once
✅ **Data Integrity** - Foreign key constraints ensure referential integrity
✅ **Easy Maintenance** - Update reference data in one place
✅ **Scalability** - Users can have multiple addresses
✅ **Performance** - Strategic indexes on frequently queried columns

## Database Schema

### Reference Tables (Lookup Data)

#### 1. **languages** - Supported Languages
```sql
id                  UUID PRIMARY KEY
code                VARCHAR(10) UNIQUE    -- ISO 639-1 (pt-BR, en-US, etc)
name                VARCHAR(50)
created_at          TIMESTAMP
```

**Pre-seeded data**: pt-BR, en-US, es-ES, fr-FR, de-DE, it-IT

#### 2. **countries** - Countries
```sql
id                  UUID PRIMARY KEY
code                VARCHAR(3) UNIQUE     -- ISO 3166-1 alpha-3 (BRA, USA, etc)
name                VARCHAR(100)
created_at          TIMESTAMP
```

**Pre-seeded data**: Brasil, United States, España, France, Germany, Italy, Portugal, Argentina, Mexico, Canada

#### 3. **states** - States/Provinces by Country
```sql
id                  UUID PRIMARY KEY
country_id          UUID FK → countries(id)
code                VARCHAR(10)           -- State code (SP, CA, NY, etc)
name                VARCHAR(100)
created_at          TIMESTAMP
UNIQUE(country_id, code)
```

**Pre-seeded data**: All 27 Brazilian states, 5 major US states

### Core Tables

#### 4. **users** - User Profile Data
```sql
id                      UUID PRIMARY KEY
firebase_uid            VARCHAR(128) UNIQUE NOT NULL
email                   VARCHAR(255) UNIQUE NOT NULL
full_name               VARCHAR(255) NOT NULL
birth_date              DATE NOT NULL
phone                   VARCHAR(50) NOT NULL
preferred_language_id   UUID FK → languages(id)
is_active               BOOLEAN DEFAULT TRUE
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

**Constraints:**
- Email format validation
- Birth date must be in the past
- Phone format validation

**Indexes:**
- firebase_uid, email, is_active, created_at, preferred_language_id

#### 5. **addresses** - User Addresses (Normalized)
```sql
id                  UUID PRIMARY KEY
user_id             UUID FK → users(id) CASCADE
address_type        VARCHAR(20)          -- primary, billing, shipping, other
street              VARCHAR(255)
number              VARCHAR(20)
complement          VARCHAR(100)
neighborhood        VARCHAR(100)
city                VARCHAR(100)
state_id            UUID FK → states(id)
postal_code         VARCHAR(20) NOT NULL
country_id          UUID FK → countries(id)
is_primary          BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

**Features:**
- **Multiple addresses per user** - Users can have primary, billing, shipping addresses
- **Cascade delete** - Addresses deleted when user is deleted
- **Primary address enforcement** - Trigger ensures only one primary address per user

**Indexes:**
- user_id, country_id, state_id, is_primary, postal_code

## API Endpoints

### Reference Data Endpoints

#### Languages
- `GET /languages` - List all languages
- `GET /languages/:id` - Get language by ID
- `GET /languages/code/:code` - Get language by code (e.g., pt-BR)

#### Countries
- `GET /countries` - List all countries
- `GET /countries/:id` - Get country by ID
- `GET /countries/code/:code` - Get country by code (e.g., BRA)

#### States
- `GET /states` - List all states
- `GET /states?countryId=xxx` - List states by country
- `GET /states/:id` - Get state by ID

### User Endpoints

#### User Management
- `POST /users` - Create user (with optional addresses)
- `GET /users` - List all users (includes addresses)
- `GET /users/:id` - Get user by ID (includes addresses)
- `GET /users/firebase/:firebaseUid` - Get user by Firebase UID
- `GET /users/email?email=xxx` - Get user by email
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (cascades to addresses)

#### Address Management
- `GET /users/:id/addresses` - Get all user addresses
- `POST /users/:id/addresses` - Add new address
- `PATCH /users/:id/addresses/:addressId` - Update address
- `DELETE /users/:id/addresses/:addressId` - Delete address

## Example API Requests

### Create User with Address

```json
POST /users
{
  "firebase_uid": "abc123xyz",
  "email": "user@example.com",
  "full_name": "João Silva",
  "birth_date": "1990-01-15",
  "phone": "+55 11 98765-4321",
  "preferred_language_code": "pt-BR",
  "addresses": [
    {
      "address_type": "primary",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state_id": "<uuid-of-sp-state>",
      "postal_code": "12345-678",
      "country_id": "<uuid-of-brazil>",
      "is_primary": true
    }
  ]
}
```

### Add Address to Existing User

```json
POST /users/:userId/addresses
{
  "address_type": "billing",
  "street": "Av. Paulista",
  "number": "1000",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state_id": "<uuid-of-sp-state>",
  "postal_code": "01310-100",
  "country_id": "<uuid-of-brazil>",
  "is_primary": false
}
```

### Update User Language Preference

```json
PATCH /users/:id
{
  "preferred_language_code": "en-US"
}
```

## Database Triggers

### 1. **update_updated_at**
Automatically updates the `updated_at` timestamp on users and addresses tables when a record is modified.

### 2. **ensure_one_primary_address**
Ensures only one address per user can be marked as primary. When a new address is marked as primary, automatically sets other addresses to non-primary.

## Normalization Example

### ❌ Before (Denormalized)
```
users table:
id | name    | country | state | language | street      | city
1  | João    | Brasil  | SP    | pt-BR    | Rua A, 123  | São Paulo
2  | Maria   | Brasil  | SP    | pt-BR    | Rua B, 456  | São Paulo
3  | José    | Brasil  | RJ    | pt-BR    | Rua C, 789  | Rio
```
**Problems:**
- "Brasil" repeated 3 times
- "SP" repeated 2 times
- "pt-BR" repeated 3 times
- Can't have multiple addresses
- No data integrity

### ✅ After (Normalized - 3NF)
```
users:
id | name    | preferred_language_id | ...
1  | João    | lang-1                | ...
2  | Maria   | lang-1                | ...
3  | José    | lang-1                | ...

addresses:
id | user_id | street      | city      | state_id | country_id
1  | 1       | Rua A, 123  | São Paulo | state-1  | country-1
2  | 2       | Rua B, 456  | São Paulo | state-1  | country-1
3  | 3       | Rua C, 789  | Rio       | state-2  | country-1

languages:
lang-1 | pt-BR | Português (Brasil)

countries:
country-1 | BRA | Brasil

states:
state-1 | country-1 | SP | São Paulo
state-2 | country-1 | RJ | Rio de Janeiro
```

**Benefits:**
- No duplicate data
- Multiple addresses per user
- Easy to add new countries/languages
- Data integrity enforced

## Performance Optimizations

### Indexes
All foreign keys and frequently queried columns have indexes:
- User lookups: firebase_uid, email
- Address queries: user_id, country_id, state_id
- Date-based queries: created_at
- Boolean filters: is_active, is_primary

### Query Performance
```sql
-- Fast: Find user by Firebase UID (indexed)
SELECT * FROM users WHERE firebase_uid = 'abc123';

-- Fast: Get all user addresses with country/state names (indexed FKs)
SELECT a.*, c.name as country, s.name as state
FROM addresses a
JOIN countries c ON a.country_id = c.id
JOIN states s ON a.state_id = s.id
WHERE a.user_id = '<user-id>';

-- Fast: Find users by language (indexed FK)
SELECT u.* FROM users u
WHERE u.preferred_language_id = '<lang-id>';
```

## Migration from Old Schema

The database has been updated from the flat structure to normalized. Key changes:

1. **Address fields moved** → Separate `addresses` table
2. **Language string** → Foreign key to `languages` table
3. **Country/State strings** → Foreign keys to `countries`/`states` tables
4. **Field names** → English names (full_name, birth_date, phone)
5. **Soft delete** → Added `is_active` flag

## Best Practices Applied

✅ **3NF Normalization** - Eliminates transitive dependencies
✅ **Foreign Key Constraints** - Enforces referential integrity
✅ **Cascade Deletes** - Addresses deleted with users
✅ **Restrict Deletes** - Can't delete referenced languages/countries
✅ **Strategic Indexes** - On all frequently queried columns
✅ **Check Constraints** - Email format, date validation
✅ **Triggers** - Auto-update timestamps, enforce business rules
✅ **ISO Standards** - ISO 639-1 languages, ISO 3166-1 countries
✅ **Documentation** - Comments on all tables and columns

## Future Enhancements

Consider adding:
- User roles/permissions table
- Audit log table for tracking changes
- User preferences table
- Additional address types (work, emergency, etc.)
- Phone numbers table (multiple phones per user)
