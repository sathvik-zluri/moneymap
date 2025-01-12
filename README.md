# MoneyMap(Backend)



# MikroORM Setup Guide

This guide outlines the steps to set up and use MikroORM effectively, including installation, configuration, and migration management.

## Setup Instructions

### 1. Configure Compiler Options
Add the following options to your `tsconfig.json` file to enable the required features for MikroORM:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true, // Required for MikroORM
    "emitDecoratorMetadata": true  // Required for MikroORM
  }
}
```

### 2. Install Required Packages
To use MikroORM successfully, ensure the following packages are installed:

- **Core and PostgreSQL Driver**: Install MikroORM and the PostgreSQL driver:
  ```bash
  npm install @mikro-orm/core @mikro-orm/postgresql
  ```

- **CLI Package**: The `npx mikro-orm` command relies on the CLI package. Install it as a development dependency:
  ```bash
  npm install @mikro-orm/cli --save-dev
  ```

- **Migrations Package**: Install the package to manage database migrations:
  ```bash
  npm install @mikro-orm/migrations
  ```

### 3. Place Configuration File
Ensure the `mikro-orm.config.ts` (or `config.ts`) file is in the root directory of your project instead of the `./src` folder. This placement is essential for MikroORM to function correctly.

### 4. Manage Migrations
MikroORM provides commands to handle migrations. Here's how to manage them:

- **Generate a Migration**  
  Create a migration file representing changes to your entities:
  ```bash
  npx mikro-orm migration:create
  ```

- **Run Migrations**  
  Apply migrations to your PostgreSQL database:
  ```bash
  npx mikro-orm migration:up
  ```
  This updates the database schema based on generated migration files.

- **Revert Migrations**  
  Undo the last applied migration:
  ```bash
  npx mikro-orm migration:down
  ```

- **Check Migration Status**  
  View the status of applied migrations:
  ```bash
  npx mikro-orm migration:status
  ```

## Additional Resources

For detailed documentation and sample code using MikroORM across various tech stacks, refer to the official guide:  
[MikroORM Documentation](https://mikro-orm.io/docs/guide)


---
# Services Overview

This application provides a set of backend services for managing transaction data. Below is a detailed description of the core services available in the application:

## 1. Add Transaction Service
- **Purpose**: Enables users to add new transaction records.
- **Features**:
  - Validates input to ensure compliance with the schema.
  - Prevents duplicate transactions based on date and description.
  - Stores the validated transaction in the database.
- **Outcome**: Adds a new transaction and automatically updates the transactions list.

---

## 2. Update Transaction Service
- **Purpose**: Allows users to modify existing transaction records.
- **Features**:
  - Accepts updated transaction details through the API.
  - Validates data for consistency and compliance with business rules.
  - Updates the record in the database and refreshes the transactions list.
- **Outcome**: Keeps transaction data accurate and up-to-date.

---

## 3. Delete Rows Service
- **Purpose**: Facilitates batch deletion of all transaction records.
- **Features**:
  - Deletes all rows in the transactions table in the database.
  - Provides feedback to confirm the deletion operation.
- **Outcome**: Clears all transaction data for scenarios requiring a reset.

---

## 4. Get Transactions Service
- **Purpose**: Fetches transaction data for display and user operations.
- **Features**:
  - Supports pagination and sorting (by date in descending order).
  - Fetches specific transactions for requested pages along with the total count.
- **Outcome**: Delivers a seamless data retrieval experience for users.

---

## 5. Upload Transaction Service
- **Purpose**: Handles bulk transaction uploads via CSV files.
- **Features**:
  - Performs client-side and server-side validation (file type, size, schema compliance, and duplicates).
  - Processes and saves valid transactions in the database.
  - Provides detailed feedback for success or failure during the upload.
- **Outcome**: Simplifies the process of adding multiple transactions efficiently.

---

