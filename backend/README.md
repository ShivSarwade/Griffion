# Griffion Authentication Backend

A secure, production-ready authentication microservice built with Node.js and Express.

## Features

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Account lockout after failed attempts
- ✅ Password reset via email
- ✅ Audit logging
- ✅ Rate limiting
- ✅ Admin panel APIs
- ✅ SQLite database (easily switchable)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Default Admin Credentials

```
Email: admin@griffion.local
Password: Admin123!
```

**⚠️ Change these credentials in production!**

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Admin (Requires Admin Role)

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user (soft delete)
- `POST /api/admin/users/:id/unlock` - Unlock locked account
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/stats` - Get statistics

### Health

- `GET /api/health` - Health check endpoint

## Example Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Environment Variables

See `.env.example` for all available configuration options.

## Security Features

- Password hashing with bcrypt (configurable rounds)
- JWT token authentication
- Rate limiting on auth endpoints
- Account lockout after failed login attempts
- Audit logging for all authentication events
- CORS protection
- Helmet security headers
- Input validation

## Database

By default, uses SQLite for easy setup. The database is created automatically at `./data/auth.db`.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## License

MIT
