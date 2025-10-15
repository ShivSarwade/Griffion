# Griffion Authentication Microservice Platform

A complete authentication platform with Next.js frontend and Node.js/Express backend.

## Project Structure

```
gliffion/
├── frontend/          # Next.js + shadcn/ui frontend
├── backend/           # Node.js + Express backend
└── README.md          # This file
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Admin Credentials

```
Email: admin@griffion.local
Password: Admin123!
```

## Features

### Frontend
- ✨ Modern UI with shadcn/ui components
- 🎨 Responsive design
- 📝 Configuration wizard
- 🏪 Landing page
- 📊 Admin dashboard (coming soon)

### Backend
- 🔐 Secure JWT authentication
- 👤 User registration & login
- 🔑 Password reset
- 🛡️ Role-based access control
- 📝 Audit logging
- 🚫 Rate limiting
- 🔒 Account lockout
- 📧 Email notifications (SMTP)

## Tech Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI

**Backend:**
- Node.js
- Express
- SQLite
- JWT
- bcrypt
- nodemailer

## Documentation

- [Frontend README](./frontend/README.md) (to be created)
- [Backend README](./backend/README.md)
- [Product Requirements Document](./PRD.md) (your existing document)

## Development

Both frontend and backend support hot-reload during development:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## License

MIT
