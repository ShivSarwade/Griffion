# 📚 Griffion Platform - Complete User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Starting the Application](#starting-the-application)
5. [Application Flow](#application-flow)
6. [Frontend Usage](#frontend-usage)
7. [Backend API Usage](#backend-api-usage)
8. [Testing with Postman](#testing-with-postman)
9. [Database Selection](#database-selection)
10. [Custom Frontend Integration](#custom-frontend-integration)
11. [Advanced Configuration](#advanced-configuration)

---

## 1. Introduction

**Griffion** is a complete authentication and user management platform that provides:
- 🔐 Production-ready authentication backend (JWT-based)
- 🎨 Modern Next.js frontend with shadcn/ui
- 🔧 Flexible configuration and backend generation
- 🌐 Multi-database support (SQLite, PostgreSQL, MySQL, MongoDB)
- 👥 Role-based access control (RBAC)
- 📊 Admin dashboard capabilities
- 🔒 Advanced security features (2FA, account lockout, audit logs)

---

## 2. Initial Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git** (optional)
- **Database** (PostgreSQL, MySQL, MongoDB) - Optional, SQLite works out of the box

### Step 1: Clone or Download the Project
```bash
cd c:\coding\griffion
```

### Step 2: Run the Setup Script
Open PowerShell in the project root and run:

```powershell
.\setup.ps1
```

This script will:
- ✅ Create `.env` file in backend (if it doesn't exist)
- ✅ Install backend dependencies
- ✅ Install frontend dependencies

**Output:**
```
╔═══════════════════════════════════════════════════════╗
║  🛡️  Griffion Authentication Platform Setup  🛡️       ║
╚═══════════════════════════════════════════════════════╝

📦 Setting up Backend...
  → Creating .env file...
  ✓ .env file created
  → Installing backend dependencies...
  ✓ Backend dependencies installed

📦 Setting up Frontend...
  → Installing frontend dependencies...
  ✓ Frontend dependencies installed

╔═══════════════════════════════════════════════════════╗
║              ✅ Setup Complete! ✅                     ║
╚═══════════════════════════════════════════════════════╝
```

---

## 3. Environment Configuration

### Backend Environment Variables

Navigate to `backend/.env` and configure:

```env
# === Server Configuration ===
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# === Database Configuration ===
# For SQLite (default - no configuration needed)
DATABASE_URL="file:./data/dev.db"

# For PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/griffion"

# For MySQL
# DATABASE_URL="mysql://user:password@localhost:3306/griffion"

# For MongoDB
# MONGODB_URI="mongodb://localhost:27017/griffion"

# === JWT Configuration ===
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# === Email Configuration (SMTP) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@griffion.local

# === Security Settings ===
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000
BCRYPT_ROUNDS=10

# === Rate Limiting ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables (Optional)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Griffion
```

---

## 4. Starting the Application

### Option 1: Quick Start (Recommended)
Run the start script in PowerShell:

```powershell
.\start.ps1
```

This will:
- ✅ Start backend on `http://localhost:5000` (new window)
- ✅ Start frontend on `http://localhost:3000` (new window)

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
# Or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Verify Running Services

- **Frontend:** Open `http://localhost:3000` in your browser
- **Backend:** Open `http://localhost:5000/api/health` (should return health status)

---

## 5. Application Flow

### 5.1 User Journey Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ARRIVES                             │
│                         ↓                                   │
│              http://localhost:3000                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  LANDING PAGE                               │
│  • View features and benefits                               │
│  • Choose: Login or Register                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┴────────────────┐
        ↓                                  ↓
┌──────────────────┐            ┌──────────────────┐
│   NEW USER       │            │  EXISTING USER   │
│   → Register     │            │   → Login        │
└──────────────────┘            └──────────────────┘
        ↓                                  ↓
┌──────────────────┐            ┌──────────────────┐
│  Registration    │            │  Login Form      │
│  • Email         │            │  • Email         │
│  • Password      │            │  • Password      │
│  • First Name    │            │                  │
│  • Last Name     │            │  Options:        │
│  • Role (opt)    │            │  • Remember Me   │
└──────────────────┘            │  • Forgot Pwd?   │
        ↓                       └──────────────────┘
        │                                  ↓
        └────────────┬─────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATION SUCCESS                         │
│  • JWT Token Generated                                      │
│  • Refresh Token Stored                                     │
│  • User Profile Loaded                                      │
└─────────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  DASHBOARD                                  │
│  • User-specific content based on role                      │
│  • Navigation menu (role-based)                             │
│  • Profile management                                       │
│  • Feature access                                           │
└─────────────────────────────────────────────────────────────┘
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────┐         ┌───────────────┐
│ Regular User │         │  Admin User   │
│ • View/Edit  │         │  • All above  │
│   Profile    │         │  • User Mgmt  │
│ • Use        │         │  • View Logs  │
│   Features   │         │  • Stats      │
└──────────────┘         └───────────────┘
```

### 5.2 Detailed Feature Flow

#### Registration Flow
1. User navigates to `/register`
2. Fills in registration form:
   - Email (required)
   - Password (required, min 8 chars, complexity rules)
   - First Name (optional)
   - Last Name (optional)
   - Role selection (if multiple public roles available)
3. System validates input
4. System creates account with selected/default role
5. User is automatically logged in
6. Redirect to dashboard

#### Login Flow
1. User navigates to `/login`
2. Enters credentials (email + password)
3. Optional: Check "Remember Me" (extends session)
4. System validates credentials
5. System checks:
   - Account locked? → Show error
   - 2FA enabled? → Request 2FA code
6. Generate JWT tokens
7. Redirect to dashboard

#### Password Reset Flow
1. User clicks "Forgot Password" on login page
2. Enters email address
3. System sends reset link via email
4. User clicks link → redirected to reset page
5. Enters new password
6. Password updated
7. Redirect to login

#### Admin Actions Flow
1. Admin logs in
2. Accesses admin panel
3. Can perform:
   - View all users
   - Edit user details
   - Delete users (soft delete)
   - Unlock locked accounts
   - View audit logs
   - View system statistics

---

## 6. Frontend Usage

### 6.1 Using the Existing Frontend

The frontend provides a complete authentication UI:

**Available Pages:**
- `/` - Landing page
- `/login` - Login form
- `/register` - Registration form
- `/forgot-password` - Password reset request
- `/dashboard` - Main dashboard (protected)
- `/configure` - System configuration (admin only)

### 6.2 Customizing Existing Pages

The dashboard folder is **empty by default** for you to customize:

**Location:** `frontend/app/(dashboard)/`

**How to add your custom pages:**

1. **Create a new page** (e.g., Profile):
```typescript
// frontend/app/(dashboard)/profile/page.tsx
export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      {/* Add your logic here */}
    </div>
  );
}
```

2. **Create a new feature page** (e.g., Reports):
```typescript
// frontend/app/(dashboard)/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from backend
    fetch('http://localhost:5000/api/reports')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div>
      <h1>Reports</h1>
      {/* Your custom logic */}
    </div>
  );
}
```

3. **Add API Integration:**
```typescript
// Example: Fetching protected data
const token = localStorage.getItem('accessToken');

fetch('http://localhost:5000/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### 6.3 Frontend File Structure

```
frontend/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Protected pages (EMPTY - Add your logic)
│   ├── configure/           # Configuration wizard
│   ├── layout.tsx           # Main layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── providers/           # Context providers
└── lib/
    ├── utils.ts             # Utilities
    └── store/               # State management
```

### 6.4 Available UI Components

The frontend uses **shadcn/ui** components:

- `<Button>` - Buttons with variants
- `<Input>` - Form inputs
- `<Card>` - Card containers
- `<Form>` - Form components
- `<Dialog>` - Modal dialogs
- `<Table>` - Data tables
- And many more...

**Example:**
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

<Button variant="default">Click Me</Button>
<Input type="email" placeholder="Email" />
```

---

## 7. Backend API Usage

### 7.1 Available API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Yes (Refresh Token) |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

#### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| POST | `/api/admin/users/:id/unlock` | Unlock account | Admin |
| GET | `/api/admin/audit-logs` | View audit logs | Admin |
| GET | `/api/admin/stats` | System statistics | Admin |

#### 2FA Endpoints (if enabled)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/2fa/enable` | Enable 2FA | Yes |
| POST | `/api/2fa/verify` | Verify 2FA code | Yes |
| POST | `/api/2fa/disable` | Disable 2FA | Yes |

### 7.2 API Request Examples

#### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User",
    "createdAt": "2025-12-27T10:00:00Z"
  }
}
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "User"
    }
  }
}
```

#### Get Current User (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Admin: Get All Users

```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## 8. Testing with Postman

### 8.1 Import Postman Collections

The project includes comprehensive Postman collections:

1. **Open Postman**
2. Click **Import** button
3. Import these files:
   - `GRIFFION_COMPLETE_API.postman_collection.json` - Complete API tests
   - `POSTMAN_REGISTRATION_GUIDE.json` - Registration examples
   - `backend/Griffion-API-Tests.postman_collection.json` - Core tests
   - `backend/TEST_BACKEND_GENERATION.postman_collection.json` - Generator tests

### 8.2 Setup Postman Environment

1. Create a new environment in Postman
2. Add these variables:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:5000` | Backend URL |
| `accessToken` | (empty) | Auto-set after login |
| `refreshToken` | (empty) | Auto-set after login |
| `userId` | (empty) | Auto-set after register/login |
| `adminEmail` | `admin@griffion.local` | Default admin email |
| `adminPassword` | `Admin123!` | Default admin password |

### 8.3 Test Flow in Postman

#### Sequence 1: User Registration & Authentication
1. **Register User** - Creates new user
2. **Login User** - Gets access tokens (auto-saved to environment)
3. **Get Current User** - Verify authentication
4. **Change Password** - Update password
5. **Logout** - End session

#### Sequence 2: Admin Operations
1. **Admin Login** - Use admin credentials
2. **Get All Users** - List users
3. **Get User By ID** - View specific user
4. **Update User** - Modify user details
5. **View Audit Logs** - Check activity
6. **Get Stats** - View statistics

#### Sequence 3: Password Reset
1. **Forgot Password** - Request reset
2. **Check Email** - Get reset token
3. **Reset Password** - Set new password
4. **Login with New Password** - Verify

### 8.4 Postman Collection Features

**Auto-Variables:**
- Tokens automatically saved after login
- User IDs captured and reused
- Dynamic test data generation

**Tests Included:**
- Status code validation
- Response structure verification
- Token validation
- Error handling tests

---

## 9. Database Selection

### 9.1 SQLite (Default)

**Pros:**
- ✅ No configuration needed
- ✅ File-based (portable)
- ✅ Perfect for development

**Setup:** Already configured! Just run the app.

**Location:** `backend/data/dev.db`

### 9.2 PostgreSQL

**Pros:**
- ✅ Production-ready
- ✅ Advanced features
- ✅ Scalable

**Setup:**

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE griffion;
CREATE USER griffion_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE griffion TO griffion_user;
```

3. Update `backend/.env`:
```env
DATABASE_URL="postgresql://griffion_user:your_password@localhost:5432/griffion"
```

4. Run migrations:
```bash
cd backend
npx prisma migrate dev
```

### 9.3 MySQL

**Setup:**

1. Install MySQL
2. Create database:
```sql
CREATE DATABASE griffion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'griffion_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON griffion.* TO 'griffion_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Update `backend/.env`:
```env
DATABASE_URL="mysql://griffion_user:your_password@localhost:3306/griffion"
```

4. Run migrations:
```bash
cd backend
npx prisma migrate dev
```

### 9.4 MongoDB

**Setup:**

1. Install MongoDB
2. Update `backend/.env`:
```env
MONGODB_URI="mongodb://localhost:27017/griffion"
```

3. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mongodb"
  url      = env("MONGODB_URI")
}
```

4. Generate Prisma client:
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 9.5 Switching Databases

To switch databases:
1. Update `DATABASE_URL` in `.env`
2. Run migrations: `npx prisma migrate dev`
3. Seed data (optional): `npm run seed`
4. Restart backend

---

## 10. Custom Frontend Integration

### 10.1 Using Your Own Frontend

You can use **any frontend framework** (React, Vue, Angular, mobile apps) with the Griffion backend!

### 10.2 Integration Steps

#### Step 1: Configure CORS

Update `backend/.env`:
```env
FRONTEND_URL=http://localhost:3001  # Your frontend URL
```

#### Step 2: API Integration

**Login Example (JavaScript/React):**
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return true;
  }
  return false;
};
```

**Protected API Call:**
```javascript
const fetchProtectedData = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    await refreshToken();
    return fetchProtectedData(); // Retry
  }
  
  return response.json();
};
```

**Token Refresh:**
```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:5000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    return true;
  }
  
  // Refresh failed, logout
  logout();
  return false;
};
```

### 10.3 Mobile App Integration

**React Native Example:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (email, password) => {
  const response = await fetch('http://YOUR_SERVER_IP:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    await AsyncStorage.setItem('accessToken', data.data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
  }
};
```

### 10.4 API-Only Mode

To use only the backend API:
1. Start only the backend: `cd backend && npm start`
2. Build your custom frontend
3. Point API calls to `http://localhost:5000`
4. Implement authentication flow
5. Handle token refresh

---

## 11. Advanced Configuration

### 11.1 Backend Generation API

Griffion includes a **backend generator** that creates custom backends based on configuration!

**Endpoint:** `POST /api/generate`

**Configuration File:** `backend/example-config.js`

**Example Configuration:**
```javascript
{
  projectName: 'My Custom App',
  dbProvider: 'postgresql',
  enable2FA: true,
  enableRBAC: true,
  roles: [
    {
      name: 'Admin',
      registrationType: 'admin',
      permissions: ['*']
    },
    {
      name: 'Customer',
      registrationType: 'public',
      permissions: ['orders.create', 'orders.read']
    }
  ]
}
```

**Generate Backend:**
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d @backend/example-config.js
```

**Result:** Complete backend generated in `backend/temp/project-XXXXX/`

### 11.2 Role Configuration

Define custom roles in your configuration:

```javascript
roles: [
  {
    name: 'Buyer',
    description: 'Can purchase products',
    registrationType: 'public',  // Users can self-register
    permissions: [
      'products.read',
      'orders.create',
      'orders.read',
      'cart.manage'
    ]
  },
  {
    name: 'Seller',
    description: 'Can sell products',
    registrationType: 'public',
    permissions: [
      'products.create',
      'products.update',
      'inventory.manage',
      'sales.read'
    ]
  },
  {
    name: 'Moderator',
    description: 'Can moderate content',
    registrationType: 'admin',  // Only admins can assign
    permissions: [
      'content.moderate',
      'users.view',
      'reports.manage'
    ]
  }
]
```

### 11.3 Navigation Tree

Define application navigation structure:

```javascript
navigationTree: [
  {
    id: 'home',
    name: 'Home',
    type: 'page',
    path: '/home',
    icon: 'home',
    isPublic: false,
    accessRoles: ['Buyer', 'Seller']
  },
  {
    id: 'products',
    name: 'Products',
    type: 'section',
    icon: 'shopping',
    children: [
      {
        id: 'browse',
        name: 'Browse Products',
        type: 'page',
        path: '/products/browse',
        accessRoles: ['Buyer', 'Seller']
      },
      {
        id: 'manage',
        name: 'Manage Products',
        type: 'page',
        path: '/products/manage',
        accessRoles: ['Seller']
      }
    ]
  }
]
```

### 11.4 Security Configuration

**Password Policy:**
```javascript
passwordPolicy: {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
}
```

**Session Settings:**
```javascript
session: {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  maxActiveSessions: 3,
  enableRememberMe: true
}
```

**Account Lockout:**
```javascript
accountLockout: {
  enabled: true,
  maxAttempts: 5,
  lockoutDuration: 900000  // 15 minutes
}
```

---

## 12. Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process or change port in .env
PORT=5001
```

#### Database connection error
```bash
# Check DATABASE_URL in .env
# Run migrations
cd backend
npx prisma migrate dev
```

#### Frontend can't connect to backend
```bash
# Check CORS settings in backend/.env
FRONTEND_URL=http://localhost:3000

# Verify backend is running
curl http://localhost:5000/api/health
```

#### Tokens not working
- Check JWT_SECRET in `.env`
- Verify token is being sent in Authorization header
- Check token expiry settings

---

## 13. Quick Reference

### Default Credentials
```
Email: admin@griffion.local
Password: Admin123!
```

### URLs
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health
```

### File Locations
```
Backend Config:   backend/.env
Frontend Config:  frontend/.env.local
Database:         backend/data/dev.db
Logs:             backend/logs/
```

### Commands
```powershell
# Setup
.\setup.ps1

# Start
.\start.ps1

# Backend only
cd backend; npm start

# Frontend only
cd frontend; npm run dev

# Database migrations
cd backend; npx prisma migrate dev

# Generate Prisma client
cd backend; npx prisma generate
```

---

## 14. Support & Documentation

- **Main README:** [README.md](README.md)
- **Backend README:** [backend/README.md](backend/README.md)
- **Example Config:** [backend/example-config.js](backend/example-config.js)
- **Postman Collections:** All `.postman_collection.json` files

---

**Happy Building with Griffion! 🛡️**
