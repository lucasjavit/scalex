# ScaleX - Docker Setup Guide

This guide will help you set up the PostgreSQL database using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Install Docker Desktop

**Windows:**
1. Download from https://www.docker.com/products/docker-desktop
2. Run the installer
3. Restart your computer
4. Launch Docker Desktop

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

**macOS:**
1. Download from https://www.docker.com/products/docker-desktop
2. Install Docker Desktop
3. Launch Docker Desktop

## Quick Start

### 1. Start the Database

From the root directory of the project (where docker-compose.yml is located):

```bash
docker-compose up -d
```

This command will:
- Download the PostgreSQL 15 Alpine image (first time only)
- Create a PostgreSQL container named `scalex-postgres`
- Create a pgAdmin container named `scalex-pgadmin`
- Automatically run the database initialization script
- Create the `users` table with all necessary indexes and triggers

### 2. Verify the Database is Running

```bash
docker-compose ps
```

You should see:
```
NAME                IMAGE                      STATUS
scalex-postgres     postgres:15-alpine         Up (healthy)
scalex-pgadmin      dpage/pgadmin4:latest      Up
```

### 3. Check Database Logs

To see if the initialization script ran successfully:

```bash
docker-compose logs postgres
```

Look for the message: `ScaleX database initialized successfully!`

### 4. Install Backend Dependencies

```bash
cd back-end
npm install
```

### 5. Start the NestJS Application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Access pgAdmin (Database Management Tool)

pgAdmin is a web-based PostgreSQL management tool included in the Docker setup.

**Access URL:** http://localhost:5050

**Login Credentials:**
- Email: `admin@scalex.com`
- Password: `admin`

### Add Server in pgAdmin

1. Right-click "Servers" → "Register" → "Server"
2. **General Tab:**
   - Name: `ScaleX`
3. **Connection Tab:**
   - Host: `postgres` (container name)
   - Port: `5432`
   - Database: `scalex`
   - Username: `postgres`
   - Password: `postgres`
4. Click "Save"

## Docker Commands Reference

### Start Services
```bash
# Start in detached mode (background)
docker-compose up -d

# Start with logs visible
docker-compose up
```

### Stop Services
```bash
# Stop containers (data persists)
docker-compose stop

# Stop and remove containers (data persists in volumes)
docker-compose down

# Stop and remove everything including volumes (DELETES ALL DATA)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service
docker-compose logs postgres
docker-compose logs pgadmin
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart postgres
```

### Execute Commands in Container
```bash
# Access PostgreSQL CLI
docker exec -it scalex-postgres psql -U postgres -d scalex

# Access container shell
docker exec -it scalex-postgres sh
```

## Database Connection Details

When running the NestJS application locally, use these connection details:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=scalex
```

## Troubleshooting

### Port Already in Use

If port 5432 or 5050 is already in use:

**Option 1: Stop existing PostgreSQL/pgAdmin**
```bash
# Windows
net stop postgresql

# Linux
sudo systemctl stop postgresql
```

**Option 2: Change ports in docker-compose.yml**
```yaml
ports:
  - "5433:5432"  # Change 5432 to 5433
```

Then update your `.env` file:
```env
DB_PORT=5433
```

### Database Not Initializing

If the database tables aren't created:

1. Remove the volume and recreate:
```bash
docker-compose down -v
docker-compose up -d
```

2. Check logs for errors:
```bash
docker-compose logs postgres
```

### Container Won't Start

1. Check Docker Desktop is running
2. Check for port conflicts:
```bash
docker-compose down
docker-compose up
```

### Cannot Connect from NestJS App

1. Verify containers are running:
```bash
docker-compose ps
```

2. Check if postgres is healthy:
```bash
docker exec -it scalex-postgres pg_isready -U postgres
```

3. Verify `.env` file settings match Docker configuration

### Reset Everything

To completely reset the database:

```bash
# Stop and remove everything
docker-compose down -v

# Remove Docker images (optional)
docker rmi postgres:15-alpine dpage/pgadmin4:latest

# Start fresh
docker-compose up -d
```

## Data Persistence

- Database data is stored in Docker volume `postgres_data`
- pgAdmin settings are stored in Docker volume `pgadmin_data`
- Data persists even when containers are stopped or removed
- Only `docker-compose down -v` will delete the data

## Production Notes

For production deployment:

1. Change default passwords in `docker-compose.yml`
2. Use environment variables for sensitive data
3. Enable SSL/TLS connections
4. Configure proper backup strategies
5. Use managed database services (AWS RDS, Google Cloud SQL, etc.)

## Network

All services run on the `scalex-network` bridge network, allowing them to communicate with each other using service names as hostnames.

## Health Checks

The PostgreSQL container includes a health check that verifies the database is ready to accept connections. The pgAdmin container waits for PostgreSQL to be healthy before starting.
