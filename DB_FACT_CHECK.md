# 🔍 Database Compatibility Fact Check

This document provides a factual analysis of the database layer within the Griffion Platform, specifically addressing Prisma's compatibility with MongoDB vs MySQL, and the feasibility of adding PostgreSQL support.

---

## 🛑 FACT CHECK: "MongoDB queries work as MySQL only"
**Verdict: FALSE / BROKEN IMPLEMENTATION**

While Prisma abstracts away *some* of the query logic (e.g., `prisma.user.findMany()` looks the same in code for both DBs), the underlying database structures and schema requirements are vastly different. **Currently, generating a MongoDB project using Griffion will result in a broken Prisma schema.**

Here is a detailed breakdown of why:

### 1. Foreign Key Type Mismatches
In `backend/src/utils/tokenReplacer.js` (Lines 94-99), Griffion correctly attempts to map the primary `id` field for MongoDB:
```javascript
  if (config.dbProvider === 'mongodb') {
    tokens['__MONGODB_ID_MAP__'] = '@map("_id") @db.ObjectId';
  }
```
**The Problem:** While the primary `id` becomes an `ObjectId`, the relation fields (foreign keys) like `userId`, `roleId`, and `groupId` in `templates/schema.prisma` are hardcoded as raw `String` types. 
- In MongoDB + Prisma, if a parent ID is an `ObjectId`, all foreign keys referencing it **MUST** also be annotated with `@db.ObjectId`. 
- Because Griffion does not dynamically append `@db.ObjectId` to `userId`, `roleId`, etc., Prisma will throw a schema validation error when running `npx prisma generate`.

### 2. Unsupported SQL Annotations
In `backend/templates/schema.prisma`, both the `RefreshToken` and `PasswordResetToken` models contain:
```prisma
token String @unique @db.VarChar(500)
```
**The Problem:** MongoDB does not have a `VARCHAR` data type. Prisma strictly validates this. If a user selects MongoDB as their provider, the presence of `@db.VarChar(500)` will cause a fatal error during schema validation.

### Conclusion on MongoDB
To make MongoDB truly work, the generator needs an update to:
1. Dynamically remove `@db.VarChar` for MongoDB.
2. Dynamically add `@db.ObjectId` to all foreign key relational fields.

---

## 🐘 FACT CHECK: "Can we add PostgreSQL without much changes?"
**Verdict: TRUE / EXTREMELY EASY**

Because PostgreSQL and MySQL are both traditional Relational Database Management Systems (RDBMS), Prisma handles them almost identically. Adding PostgreSQL support to Griffion requires **less than 10 lines of code changed**.

### Why it's easy:
1. **Schema Compatibility:** PostgreSQL fully supports string UUIDs, cascade deletes, and unique compound constraints exactly as they are currently written in `templates/schema.prisma`. 
2. **Annotation Compatibility:** PostgreSQL supports `@db.VarChar(500)`, so no schema rewrites are necessary.

### Exactly what needs to change to support PostgreSQL:

**1. Update `tokenReplacer.js` (Lines 17-34):**
Add a simple block to format the PostgreSQL connection string.
```javascript
function buildDatabaseUrl(config) {
  const { dbProvider, dbHost, dbPort, dbName, dbUser, dbPassword } = config;
  
  if (dbProvider === 'mysql') {
    return \`mysql://\${dbUser}:\${dbPassword}@\${dbHost}:\${dbPort || 3306}/\${dbName}\`;
  }
  
  if (dbProvider === 'postgresql' || dbProvider === 'postgres') {
    return \`postgresql://\${dbUser}:\${dbPassword}@\${dbHost}:\${dbPort || 5432}/\${dbName}\`;
  }
  // ...
}
```

**2. Update `tokenReplacer.js` (Line 166):**
```javascript
  tokens['__DB_PROVIDER_NAME__'] = config.dbProvider === 'mysql' ? 'MySQL' :
                                   config.dbProvider === 'postgresql' ? 'PostgreSQL' :
                                   config.dbProvider === 'mongodb' ? 'MongoDB' : 'MySQL';
```

That is literally all that is required. Once those changes are made, a user passing `dbProvider: "postgresql"` in their config will receive a perfectly functioning PostgreSQL application.

---

## 📋 Summary
1. **MongoDB is currently broken** due to missing `@db.ObjectId` annotations on foreign keys and unsupported `@db.VarChar` annotations.
2. **PostgreSQL can be added immediately** with just a few lines added to the `buildDatabaseUrl` function in the token replacer.
