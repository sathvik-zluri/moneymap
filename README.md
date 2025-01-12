# moneymap


```markdown
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
```

This streamlined `README.md` integrates the installation and migration workflow into a single cohesive section for ease of use.