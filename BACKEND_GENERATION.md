# Griffion Backend Generation Process

This document outlines how the Griffion backend generates a new, customized backend project for a customer, what is included or excluded, and guidelines for packaging a lightweight version.

## 1. How the Backend Generates a New Backend (The Process)

The backend generation follows a **"Static-First"** approach, acting essentially as a template engine. Here is the step-by-step process:

1. **Template Duplication**: It starts by copying a base "tokenized reference app" (the `templates/` directory) into a temporary unique project directory (e.g., `temp/project-[timestamp]`).
2. **Token Replacement**: A map of tokens is built based on the user's configuration payload. It recursively scans text files (`.js`, `.json`, `.prisma`, `.md`, `.env`, `.html`, `.css`) in the new directory and replaces placeholders with actual customer configuration values.
3. **Source File Assembly**: Core files (like authentication, error handling, rate limiting) are copied over from the main `backend/src/` to the new project's `src/`.
4. **Conditional Feature Inclusion**: Based on the configuration, it selectively injects additional controllers and routes (e.g., Admin Panel, Groups, Navigation). Import paths are automatically fixed to match the new directory structure.
5. **Database Configuration**: It prepares the Prisma schema. If the user selected MongoDB, it keeps `schema.mongodb.prisma` (renaming it to `schema.prisma`) and deletes the SQL version. If SQL was selected, it keeps `schema.sql.prisma` and deletes MongoDB.
6. **Meta & Documentation Setup**: It dynamically creates standard project files like `.gitignore`, `Dockerfile`, `.dockerignore`, and renames `.env.template` to `.env`. It also injects API guides and a comprehensive Postman collection.
7. **Packaging**: The entire folder is zipped using high compression (zlib level 9) and prepared for download.

## 2. What It Includes

The generated backend is a fully functional, container-ready Node.js application. It includes:

- **Core Infrastructure**: 
  - Express.js setup, security middleware (rate limiting, error handlers).
  - Config files (`config.json`, `.env`).
- **Database Layer**:
  - A tailored `prisma/schema.prisma` file specific to the chosen database provider (SQL or MongoDB).
- **Core Features**:
  - Authentication (Registration, Login, 2FA, Password Recovery).
  - User Management and Email Utilities.
  - Audit logging.
- **Conditional Features (if enabled)**:
  - Admin routes & controllers (`routes/admin.js`, etc.).
  - Group Management.
  - Role-Based Access Control (RBAC).
  - Dynamic Navigation system.
- **Deployment & Meta**:
  - `Dockerfile` and `.dockerignore`.
  - `.gitignore`.
  - `package.json` with necessary dependencies.
- **Documentation**:
  - Complete `DOCUMENTATION.md` (README).
  - `docs/` folder containing API, Config, and Registration guides.
  - `GRIFFION_API.postman_collection.json` with 35+ pre-configured endpoints.

## 3. What It Does NOT Include

To keep the generation clean and secure, the system explicitly strips out or skips:

- **Frontend Assets**: The `my-nextjs-app` folder inside the templates is intentionally skipped.
- **Unselected Database Schemas**: If the user chose SQL, the MongoDB schema is completely removed (and vice versa).
- **Disabled Features**: If a feature (like the Admin Panel) is toggled off, its specific routes and controllers are never copied into the project.
- **Heavy Dependencies (`node_modules`)**: Dependencies are strictly omitted. The user must run `npm install` themselves.
- **Version Control (`.git`)**: The generator strips out any Git history from the template.
- **Live Data / Temp Files**: No `temp/` build artifacts, `data/` directories, or `.db`/`.sqlite` files are included.

## 4. Packaging the "Lightweight Shit" (Optimal Distribution)

If you need to intercept this process or manually package a **lightweight** version to send to a client, you should only include the absolute bare minimum required for them to build it. 

### What to KEEP:
* `src/` (All source code: routes, controllers, middleware, utils)
* `prisma/schema.prisma`
* `package.json` (and `package-lock.json` if you want strictly locked versions)
* `.env.template` (DO NOT send a populated `.env` with real production secrets)
* `.gitignore`
* `Dockerfile` / `.dockerignore`
* `docs/` and `DOCUMENTATION.md`
* `*.postman_collection.json`

### What to AGGRESSIVELY EXCLUDE (via `.zip` ignore rules or `.npmignore`):
* ❌ `node_modules/` (Bloats the zip by hundreds of MBs)
* ❌ `.git/` folder (Unnecessary history and size)
* ❌ `temp/`, `dist/`, or `build/` folders
* ❌ `.env`, `.env.local` (Security risk!)
* ❌ `npm-debug.log` or any `*.log` files
* ❌ Any database files (`*.db`, `*.sqlite`, `data/`)
* ❌ OS specific hidden files (`.DS_Store`, `Thumbs.db`)
* ❌ IDE configuration folders (`.vscode/`, `.idea/`)

By sticking strictly to the source code and configuration files, the resulting ZIP should only be around **2 MB to 5 MB**, making it extremely fast to generate, email, or download.
