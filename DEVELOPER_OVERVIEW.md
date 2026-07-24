# 🦅 Griffion Platform: Developer Overview

Welcome to Griffion! This guide explains the core workflow of how our platform generates a customized full-stack starter app for developers, where the underlying templates are stored, and what the resulting project structure looks like.

---

## 🚀 1. The Generation Flow
When a developer requests a new starter app from Griffion, the platform orchestrates a seamless "Static-First" generation process. Here is step-by-step how the engine provisions a new stack:

1. **Configuration Input**: The user defines their architectural requirements (e.g., project name, auth types, enabled features like RBAC/groups/admin panel) which is passed as a JSON configuration object.
2. **Scaffolding (`temp/project-{timestamp}`)**: The `fullstackGenerator.js` script provisions a temporary staging directory where the new project will be built.
3. **Backend Generation**: 
   - The engine copies the base backend template files from `backend/templates/`.
   - A Token Map is built using the user's config. The engine parses every template file and replaces variables (e.g. app name, DB ports, auth secrets) with the customized values.
   - Core server routes, middleware, controllers, and Prisma schemas are dynamically injected based on the requested features.
4. **Frontend Generation**: 
   - The engine triggers `frontendGenerator.js` which prepares the Next.js React application using the `my-nextjs-app` template.
   - Theme variables, API URLs, and Redux slices are wired up automatically.
5. **Orchestration Meta-Files**: 
   - A `docker-compose.yml` file is dynamically written to the project root for easy 1-click deployments.
   - A comprehensive `README.md` and documentation files (API Guides, Postman Collections) are generated into the project.
6. **Packaging**: The entire staging directory is compressed into a ZIP archive using the `archiver` library.
7. **Delivery**: The ZIP file is downloaded by the developer. They simply extract it, run `npm install`, and have a production-ready stack!

---

## 📁 2. Where are the Templates Stored?
All the "raw material" used to generate these applications lives within the `backend/templates/` directory.

- `backend/templates/database/` - Contains the DB initialization and seeding scripts.
- `backend/templates/my-nextjs-app/` - The Next.js template application containing React components, app router pages, and Redux logic.
- `backend/templates/schema.prisma` - The template for the Prisma ORM schema.
- `backend/templates/.env.template` - The blueprint for environment variables.
- `backend/templates/package.json` - Dependency declarations.

The core business logic (Controllers, Routes, Middleware) are actually copied directly from the generator's *own* source code (`backend/src/`) and structurally adapted to fit the generated app.

---

## 🏗️ 3. The Generated Folder Structure
Once the developer downloads and unzips their generated Griffion app, they will see a professional, microservice-ready monorepo structure. 

Here is an overview of what the developer receives:

```text
my-griffion-app/
│
├── backend/                        # Node.js + Express + Prisma API
│   ├── src/                        # Core backend source code
│   │   ├── controllers/            # Business logic (auth, admin, users)
│   │   ├── middleware/             # Route protection, rate limiters
│   │   ├── routes/                 # Express API endpoints
│   │   ├── database/               # Prisma client init & seed scripts
│   │   ├── utils/                  # Helpers (email, audit logging)
│   │   └── config.json             # Dynamic config injected by Griffion
│   │
│   ├── prisma/                     # Database schema definition
│   │   └── schema.prisma           
│   │
│   ├── docs/                       # Auto-generated API documentation
│   ├── GRIFFION_API.postman.json   # Ready-to-use Postman tests
│   ├── Dockerfile                  # Backend container spec
│   ├── .env                        # Local environment variables
│   └── package.json                
│
├── frontend/                       # Next.js App Router UI
│   ├── app/                        # Next.js pages and layouts
│   │   ├── (dashboard)/            # Protected application views
│   │   ├── login/                  # Auto-generated auth flows
│   │   └── register/               
│   │
│   ├── components/                 # Reusable React UI components
│   ├── lib/                        # Redux store, API clients
│   ├── Dockerfile                  # Frontend container spec
│   ├── .env.local                  # Local frontend variables
│   └── package.json                
│
├── docker-compose.yml              # Orchestrates Frontend + Backend + PostgresDB
└── README.md                       # Project-specific setup instructions
```

---

## 💡 Quick Tips for New Contributors
- **Modifying the Backend Template?** If you are changing how the *generated* backend behaves, you likely need to modify the files in `backend/src/` (for routes/controllers) or `backend/templates/` (for schemas/configs).
- **Modifying the Frontend Template?** Changes to the generated Next.js app should be made inside `backend/templates/my-nextjs-app/`.
- **Testing the Generator:** Use the `backend/test-generator.js` script to simulate a user generation request locally and verify the ZIP output.
