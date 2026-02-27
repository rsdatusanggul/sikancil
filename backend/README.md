# Si-Kancil Backend

**Sistem Informasi Keuangan BLUD** - Backend API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Description

Si-Kancil adalah sistem informasi keuangan untuk Badan Layanan Umum Daerah (BLUD) yang menyediakan manajemen keuangan, pelaporan, dan dashboard analitik. Backend ini dibangun dengan NestJS framework dan mengikuti best practices untuk enterprise application.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 17
- **ORM**: TypeORM 0.3
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Package Manager**: pnpm

## Features

- ✅ JWT Authentication & Authorization
- ✅ User Management with Role-Based Access Control (RBAC)
- ✅ PostgreSQL with TypeORM
- ✅ Swagger API Documentation
- ✅ Request Validation & Transformation
- ✅ Security Headers (Helmet)
- ✅ Rate Limiting
- ✅ CORS Configuration
- ✅ Soft Delete Support
- ✅ Audit Trail (createdBy, updatedBy, timestamps)
- ✅ Hot Reload for Development

## Project Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Response interceptors
│   │   └── pipes/           # Custom validation pipes
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   └── users/           # User management module
│   ├── database/            # Database related
│   │   ├── migrations/      # TypeORM migrations
│   │   ├── seeders/         # Database seeders
│   │   └── entities/        # Shared entities
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env
├── .env.example
└── package.json
```

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 17
- pnpm (package manager)

## Installation

1. Clone the repository:
```bash
cd /opt/sikancil/backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Database configuration in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=sikancil_user
DB_PASSWORD=sikancil_dev_password
DB_DATABASE=sikancil_dev
```

## Running the Application

### Development Mode (with hot reload)
```bash
pnpm run start:dev
```

### Production Mode
```bash
pnpm run build
pnpm run start:prod
```

### Debug Mode
```bash
pnpm run start:debug
```

## API Documentation

Once the application is running, access the Swagger documentation at:

**Swagger UI**: http://localhost:3000/api/docs

**API Base URL**: http://localhost:3000/api/v1

## Available Endpoints

### Authentication (`/api/v1/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (requires JWT)

### Users (`/api/v1/users`)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user

## Testing the API

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@sikancil.id",
    "password": "Admin123",
    "fullName": "Administrator"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123"
  }'
```

### Get Profile (with JWT token):
```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Roles

The system supports the following roles:
- `super_admin` - Super administrator with full access
- `admin` - Administrator
- `kepala_blud` - Head of BLUD
- `bendahara` - Treasurer
- `staff_keuangan` - Finance staff
- `user` - Regular user

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `username` (string) - Unique username
- `email` (string) - Unique email
- `password` (string) - Hashed password
- `fullName` (string) - Full name
- `nip` (string) - Employee ID number
- `jabatan` (string) - Position/title
- `role` (enum) - User role
- `status` (enum) - User status (active, inactive, suspended)
- `phone` (string) - Phone number
- `blud_id` (string) - BLUD entity reference
- `avatar` (string) - Avatar URL
- `lastLogin` (timestamp) - Last login time
- `createdAt` (timestamp) - Created timestamp
- `updatedAt` (timestamp) - Updated timestamp
- `deletedAt` (timestamp) - Soft delete timestamp
- `createdBy` (string) - Created by user ID
- `updatedBy` (string) - Updated by user ID

## Testing

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Code Quality

```bash
# format code
pnpm run format

# lint code
pnpm run lint
```

## Environment Variables

See `.env.example` for all available environment variables:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=Si-Kancil

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=sikancil_user
DB_PASSWORD=sikancil_dev_password
DB_DATABASE=sikancil_dev

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@sikancil.id
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-Origin Resource Sharing
- **Rate Limiting**: 100 requests per 60 seconds
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: class-validator for all DTOs
- **SQL Injection Protection**: TypeORM parameterized queries

## Development Notes

### For BLUD Context:
- All financial tables use **soft delete** for audit trail
- Every transaction has `created_by`, `updated_by`, `approved_by` fields
- Row-level security for multi-tenancy BLUD
- Complete logging for all financial data changes
- `tahun_anggaran` field required for all financial entities

## Next Steps

After backend setup, proceed to:
1. **Database Schema Design** - Design BLUD entities
2. **Core Modules Implementation** - Implement BLUD, Keuangan, Laporan modules
3. **API Endpoints** - Create REST API endpoints
4. **Frontend Integration** - Integrate with React frontend

## Support & Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

UNLICENSED - Proprietary software for BLUD institutions.

## Author

RSDS_DEV - Si-Kancil Development Team

---

**Version**: 1.0.0
**Last Updated**: February 2026
