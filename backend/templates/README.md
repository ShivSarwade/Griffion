# __PROJECT_NAME__

__PROJECT_DESCRIPTION__

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- __DB_PROVIDER_NAME__ database

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env .env.local
   ```
   
   Edit `.env.local` and update:
   - `DATABASE_URL` - Your database connection string
   - `JWT_SECRET` & `JWT_REFRESH_SECRET` - Strong random secrets
   - Other configuration as needed

3. **Initialize database:**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

The server will run on `http://localhost:__PORT__`

## 🔐 Default Admin Account

- **Email:** __ADMIN_EMAIL__
- **Password:** __ADMIN_PASSWORD__

**⚠️ CRITICAL:** Change this password immediately after first login!

## 📡 API Endpoints

### Public Endpoints

#### Configuration
- `GET /api/config/auth` - Get authentication configuration

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
__PASSWORD_RECOVERY_ENDPOINTS__
__2FA_ENDPOINTS__

### Protected Endpoints (Require Authentication)

#### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `PATCH /api/users/me/preferences` - Update preferences

#### Authentication (Protected)
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

__ADMIN_ENDPOINTS__

__NAVIGATION_ENDPOINTS__

__GROUP_ENDPOINTS__

## 🗄️ Database

This backend uses **__DB_PROVIDER_NAME__** with Prisma ORM.

### Database Schema

- **Users** - User accounts with authentication
- **Roles** - Role-based access control
- **RefreshTokens** - JWT refresh token management
- **AuditLogs** - Security audit trail
- **PasswordResetTokens** - Password recovery tokens
- **NavigationNodes** - Hierarchical navigation structure
__GROUP_SCHEMA__

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes (development)
npm run prisma:push

# Create migration (production)
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 🔒 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ Rate limiting on sensitive endpoints
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ Account lockout after failed attempts
- ✅ Comprehensive audit logging
__2FA_SECURITY__
__RBAC_SECURITY__

## 🛠️ Configuration

All configuration is done via environment variables in `.env`:

### Server Configuration
- `PORT` - Server port (default: __PORT__)
- `NODE_ENV` - Environment (production/development)
- `FRONTEND_URL` - CORS allowed origin

### Database
- `DATABASE_URL` - Database connection string

### JWT Configuration
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `JWT_EXPIRY` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRY` - Refresh token expiry (default: 7d)

### Authentication
- `PRIMARY_IDENTIFIER` - Login identifier (__PRIMARY_IDENTIFIER__)
- `ENABLE_2FA` - Two-factor authentication (__ENABLE_2FA__)
- `ENABLE_PASSWORD_RECOVERY` - Password recovery (__ENABLE_PASSWORD_RECOVERY__)

### Security
- `MAX_LOGIN_ATTEMPTS` - Max failed login attempts (default: 5)
- `LOCKOUT_DURATION_MINUTES` - Account lockout duration (default: 15)
- `RATE_LIMIT_WINDOW_MINUTES` - Rate limit window (default: 15)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

__EMAIL_SECTION__

## 📦 Deployment

### Production Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure production database
- [ ] Set up email service (if using password recovery)
- [ ] Configure CORS for your frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment

```bash
# Build image
docker build -t __PROJECT_NAME_SLUG__ .

# Run container
docker run -p __PORT__:__PORT__ --env-file .env __PROJECT_NAME_SLUG__
```

## 🧪 Development

```bash
# Development with auto-reload
npm run dev

# View database in browser
npm run prisma:studio
```

## 📝 License

MIT License

---

**Powered by Griffion** - Backend-as-a-Service Platform
