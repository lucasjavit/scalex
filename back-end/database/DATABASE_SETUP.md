# ScaleX - Database Setup Guide

## Prerequisites

- PostgreSQL installed and running (version 12 or higher)
- Node.js and npm installed

## Database Setup Steps

### 1. Install PostgreSQL

If you don't have PostgreSQL installed:

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run the installer and set a password for the postgres user

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

### 2. Create Database

Access PostgreSQL:

```bash
# Windows
psql -U postgres

# Linux/macOS
sudo -u postgres psql
```

Create the database:

```sql
CREATE DATABASE scalex;
```

Exit psql:
```sql
\q
```

### 3. Run Database Schema

Run the schema script to create tables:

```bash
# Windows
psql -U postgres -d scalex -f database/schema.sql

# Linux/macOS
sudo -u postgres psql -d scalex -f database/schema.sql
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password_here
   DB_DATABASE=scalex
   ```

### 5. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev
```

## Database Schema

### Users Table

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary key (auto-generated) |
| firebase_uid | VARCHAR(128) | Yes | Firebase Authentication UID (unique) |
| email | VARCHAR(255) | Yes | User email (unique) |
| nome_completo | VARCHAR(255) | Yes | Full name |
| data_nascimento | DATE | Yes | Date of birth |
| cep | VARCHAR(20) | Yes | Postal code |
| pais | VARCHAR(100) | Yes | Country |
| telefone_contato | VARCHAR(50) | Yes | Contact phone |
| idioma_preferido | VARCHAR(10) | Yes | Preferred language (pt-BR, en-US, etc.) |
| rua | VARCHAR(255) | No | Street address |
| numero | VARCHAR(20) | No | Street number |
| bairro | VARCHAR(100) | No | Neighborhood |
| cidade | VARCHAR(100) | No | City |
| estado | VARCHAR(100) | No | State |
| created_at | TIMESTAMP | Auto | Creation timestamp |
| updated_at | TIMESTAMP | Auto | Last update timestamp |

## API Endpoints

### User Management

- **POST** `/users` - Create new user
- **GET** `/users` - Get all users
- **GET** `/users/:id` - Get user by ID
- **GET** `/users/firebase/:firebaseUid` - Get user by Firebase UID
- **GET** `/users/email?email=user@example.com` - Get user by email
- **PATCH** `/users/:id` - Update user
- **DELETE** `/users/:id` - Delete user

### Example Request - Create User

```json
POST http://localhost:3000/users
Content-Type: application/json

{
  "firebase_uid": "firebase_unique_id_here",
  "email": "user@example.com",
  "nome_completo": "João Silva",
  "data_nascimento": "1990-01-15",
  "cep": "12345-678",
  "pais": "Brasil",
  "telefone_contato": "+55 11 98765-4321",
  "idioma_preferido": "pt-BR",
  "rua": "Rua das Flores",
  "numero": "123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

## Troubleshooting

### Connection Issues

If you get database connection errors:

1. Check if PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status

   # Linux
   sudo systemctl status postgresql
   ```

2. Verify your credentials in `.env` file

3. Check if the database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

## Development Notes

- **Auto-sync enabled in development**: TypeORM will automatically sync your entity changes to the database when running in development mode
- **Validation**: All API requests are validated using class-validator
- **CORS**: Enabled for the front-end (default: http://localhost:5173)
