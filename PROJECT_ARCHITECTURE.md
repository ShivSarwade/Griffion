# 🗺️ Griffion Full Project Architecture

This document provides a high-level overview of the entire Griffion workspace. 

Griffion is essentially a **"BaaS (Backend-as-a-Service) Generator Platform"**. It consists of a Web UI where users can visually design an application's architecture (Auth types, RBAC, etc.), and a powerful Node.js engine that compiles those choices into a downloadable, ready-to-run ZIP containing a Next.js frontend and Node.js backend.

Here is what each folder in the repository is responsible for:

---

## 1. `/frontend` (The Platform UI)
This directory contains the **Griffion Platform Website**. 
- **What it is:** A Next.js application that serves as the marketing landing page and the visual configuration orchestrator.
- **Key Files:** 
  - `app/page.tsx`: The main landing page for Griffion.
  - `app/configure/`: The interactive UI where users design their architecture (roles, features, themes).
- **How it works:** When a user clicks "Generate" on this site, it sends a JSON payload of their configuration choices to the `/backend` server's generation endpoints.

---

## 2. `/backend` (The Engine & API)
This is the heart of the platform. It serves two completely different purposes:
1. **The Generator Engine**: It listens for requests from the `/frontend` UI, reads templates, replaces tokens based on user configuration, zips them up, and returns them.
2. **The Default API Template**: The source code here (`src/routes`, `src/controllers`) acts as the "source of truth" template. When generating a new app for a user, the engine literally copies files from its own `src/` directory into the user's new ZIP file.

**Key Sub-Directories in `/backend`:**
- `src/utils/fullstackGenerator.js` & `backendGenerator.js`: The actual compilation scripts that build the ZIP files.
- `src/controllers/` & `src/routes/`: The actual API logic (Auth, Users, Admin, Groups). These run when you start the backend, and are ALSO copied into generated projects.
- `templates/`: Contains raw scaffolding templates (like `schema.prisma`, `package.json`, and `.env.template`) as well as the complete `my-nextjs-app` Next.js boilerplate used during generation.
- `prisma/`: The ORM schema powering the backend's own database.

---



## 4. `/tickets`
This directory is used for project management.
- Contains markdown files or JSON used to track development tasks, bugs, feature roadmaps, and TODOs for the Griffion platform itself.

---

## 5. Root Configuration Files
- `setup.ps1`: A PowerShell script that automates the installation of both `/frontend` and `/backend` dependencies.
- `start.ps1`: A script to simultaneously boot up the Next.js UI on port 3000 and the Node.js Engine on port 5000.
- `POSTMAN_REGISTRATION_GUIDE.json` & Postman collections: API test suites to verify that the generated backend features (Auth, Users, Groups) actually work.

---

### 🔄 The Full Workflow in Action:
1. You run `.\start.ps1`.
2. The user visits `http://localhost:3000` (served from `/frontend`).
3. They use the `/configure` page to build their app and submit it.
4. The request hits `http://localhost:5000/api/generate` (served from `/backend`).
5. The `/backend` engine pulls from `backend/templates/`, wires everything together, and streams a ZIP file back to the browser!
