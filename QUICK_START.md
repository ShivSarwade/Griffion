# Quick Start: Configuration

Transform your application requirements into a functional codebase in minutes.

## Step 1: Access the Platform

1. Open your browser and navigate to the Griffion frontend: **http://localhost:3000**
2. Click the **"Start Configuration"** or navigate to `/configure` to launch the wizard

## Step 2: Configuration Wizard

Complete all 6 steps of the configuration wizard:

| Step | Section | Description |
|------|---------|-------------|
| **01** | **Project Information** | Enter your project name, description, and author details |
| **02** | **Authentication** | Select **Email** or **Username** for user authentication<br/>Toggle **2FA** (Two-Factor Authentication) |
| **03** | **Infrastructure** | Choose your database engine: **MySQL** or **MongoDB**<br/>Select default theme: **Light** or **Dark** |
| **04** | **Admin Setup** | Configure admin credentials (email, password, first name, last name) |
| **05** | **Roles & Access** | Define roles (e.g., Admin, Manager, User, Buyer, Seller)<br/>Add role descriptions<br/>Set registration types: **Public** (self-register) or **Admin Only** |
| **06** | **Navigation** | Build your navigation tree with sections and pages<br/>Set page paths (e.g., `/dashboard`, `/admin/users`)<br/>Choose icons from 40+ available options<br/>Configure role-based access per node |

### What Happens Behind the Scenes

The wizard automatically configures these settings (you don't need to):
- ✅ Port numbers (Backend: 5000, Frontend: 3000)
- ✅ Feature flags (Password Recovery, Admin Panel, RBAC, Navigation)
- ✅ Role permissions (Admin gets `['*']`, others get specific permissions)
- ✅ Navigation properties (order, isPublic flag)

## Step 3: Generate & Download

1. Review your configuration in the wizard
2. Click **"Build Griffion Application"** button
3. Wait for the generation process (usually 10-30 seconds)
4. Your browser will automatically download: `{project-name}-fullstack.zip`

## 🛠️ Installation & Setup

Extract the ZIP file and follow these steps to initialize your environment.

### Project Structure

```
my-project-fullstack/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # Next.js + TypeScript + Redux
├── docker-compose.yml
└── README.md
```

### Option 1: Docker Compose (Recommended)

The fastest way to get everything running:

```bash
# Extract and navigate to project
cd my-project-fullstack

# Start everything with one command
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### Option 2: Manual Setup

#### 1. Backend Setup (Port 5000)

```bash
cd backend
npm install                 # Install dependencies
npx prisma generate         # Generate Prisma client
npx prisma db push          # Sync database schema
npm start                   # Start the server
```

**Backend Requirements:**
- Node.js 18+ 
- MySQL or MongoDB running locally
- Update `.env` file with your database credentials if needed

#### 2. Frontend Setup (Port 3000)

```bash
cd frontend
npm install                 # Install dependencies
npm run dev                 # Start development server
# OR for production:
npm run build               # Build the production bundle
npm start                   # Launch the application
```

### Default Admin Credentials

After setup, login with the admin credentials you configured in Step 4:

- **Email:** (the email you provided)
- **Password:** (the password you set)

⚠️ **Important:** Change these credentials in production!

## 📦 What's in the Box?

### Backend Features

- **Security:** JWT-based authentication with refresh tokens
- **2FA:** Email-based OTP verification (if enabled)
- **RBAC:** Full Role-Based Access Control system
- **ORM:** Prisma for type-safe database queries
- **API Routes:**
  - `/api/auth/*` - Authentication (login, register, 2FA, password recovery)
  - `/api/admin/*` - Admin operations (user management, role assignment)
  - `/api/navigation/*` - Dynamic navigation based on user roles
  - `/api/user/*` - User profile management

### Frontend Features

- **Framework:** Next.js 14 with App Router
- **State:** Redux Toolkit with Redux Persist
- **Styling:** Tailwind CSS with dark/light theme
- **Auth Pages:** Login, Register, Forgot Password, Reset Password, 2FA Verification
- **Dynamic Navigation:** Role-based sidebar that adapts to user permissions
- **Dashboard:** Responsive layout with modern UI components

### Auto-Generated Registration Routes

Based on your role configuration, users can register at:

1. **Default Registration:** `http://localhost:3000/register`
   - Uses the default public role

2. **Role-Specific Registration:** 
   - `http://localhost:3000/buyer/register`
   - `http://localhost:3000/seller/register`
   - (One route per public role)

## 🎨 Customization Paths

The generated code is production-ready but designed to be extended:

### Option 1: UI Customization

**Theme & Branding:**
- Edit `frontend/app/globals.css` for global styles
- Modify `frontend/tailwind.config.ts` for colors and design tokens
- Update navigation icons in the Redux store or via admin panel

**Layouts & Components:**
- Customize layouts in `frontend/app/layout.tsx`
- Modify page components in `frontend/app/(dashboard)/`
- Add custom components in `frontend/components/`

### Option 2: Backend Logic Expansion

**Add New Features:**
1. Create new routes in `backend/src/routes/`
2. Add controllers in `backend/src/controllers/`
3. Update Prisma schema in `backend/prisma/schema.prisma`
4. Run `npx prisma migrate dev` to create migrations

**Example: Add a Products feature**
```bash
# 1. Update schema
# Add Product model to schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_products

# 3. Add routes
# Create backend/src/routes/products.js

# 4. Add controller
# Create backend/src/controllers/productController.js
```

### Option 3: Microservices Architecture

Use the generated backend as an **Identity Provider**:

1. Keep the generated auth system as your central authentication service
2. Build additional services that validate Griffion's JWT tokens
3. Share the JWT secret across services
4. Each service verifies tokens but delegates auth to Griffion

## 💡 Pro-Tips

> [!TIP]
> **Keep Prisma Updated:** Always run `npx prisma generate` after making changes to your database models to keep TypeScript types and autocompletion up to date.

> [!IMPORTANT]
> **Database Must Be Running:** Ensure your database service (MySQL/MongoDB) is running before executing `npx prisma db push` or `npm start`.

> [!TIP]
> **Environment Variables:** The `.env` file in the backend contains all configuration. Update `DATABASE_URL`, `JWT_SECRET`, and email settings for production.

> [!WARNING]
> **Security:** Change the default admin credentials immediately after first login in production environments.

> [!TIP]
> **Navigation Updates:** You can modify navigation dynamically through the admin panel or by updating the database directly. The frontend automatically reflects changes on user login.

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Verify database connection
# Check DATABASE_URL in .env file
```

### Frontend won't connect to backend

```bash
# Verify backend is running on port 5000
# Check NEXT_PUBLIC_API_URL in frontend/.env.local
# Default should be: http://localhost:5000
```

### Prisma errors

```bash
# Reset and regenerate everything
npx prisma generate
npx prisma db push --force-reset

# This will drop all data - use with caution!
```

## 📚 Next Steps

1. ✅ Complete the configuration wizard
2. ✅ Download and extract your project
3. ✅ Run the setup commands
4. ✅ Login with admin credentials
5. 🚀 Start building your custom features!

---

**Need Help?** Check the generated README.md files in both backend and frontend directories for detailed documentation on the specific features you configured.
