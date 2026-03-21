# Mr. Fixer — Backend

Node.js + Express REST API backed by a MySQL database.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm | 9 or later |
| MySQL | 8 or later |

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=mr_fixer_db
JWT_SECRET=a_long_random_secret_string
FRONTEND_URL=http://localhost:5173   # your frontend origin
```

> **Tip:** Generate a strong JWT secret with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Create the database

```sql
CREATE DATABASE mr_fixer_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations

Migrations create all the required tables automatically.

```bash
npm run migrate
```

### 5. (Optional) Seed data

```bash
npm run seed
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5001`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restarts on file changes) |
| `npm start` | Start without nodemon (production) |
| `npm run lint` | Check code for style/error issues |
| `npm run lint:fix` | Auto-fix formatting and common issues |
| `npm run knex -- <command>` | Run any Knex CLI command |
| `npm run migrate` | Run pending database migrations |
| `npm run migrate:make <name>` | Create a new migration file |
| `npm run migrate:rollback` | Roll back the latest migration batch |
| `npm run seed` | Run all Knex seed files |
| `npm run seed:run` | Run all Knex seed files |
| `npm run seed:make <name>` | Create a new seed file |

---

## Project structure

```
backend/
├── src/
│   ├── app.js              # Express app setup (middleware, routes)
│   ├── server.js           # Server entry point (DB check → listen)
│   ├── config/
│   │   ├── constants.js    # Shared constants (e.g. JWT_SECRET)
│   │   └── db.js           # MySQL connection pool (mysql2/promise)
│   ├── routes/             # Route definitions — map URLs to controllers
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   └── providerRoutes.js
│   ├── controllers/        # Handle HTTP request/response
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── fixerDashboardController.js
│   │   └── serviceCategoryController.js
│   ├── services/           # Business logic (called by controllers)
│   │   ├── authService.js
│   │   ├── providerRequestService.js
│   │   └── serviceCategoryService.js
│   ├── models/             # Database queries
│   │   ├── userModel.js
│   │   ├── bookingModel.js
│   │   ├── adminModel.js
│   │   ├── fixerDashboardModel.js
│   │   └── serviceCategoryModel.js
│   └── middleware/
│       ├── authMiddleware.js   # Verify JWT → sets req.user
│       ├── adminMiddleware.js  # Allow only role=admin
│       └── upload.js           # Multer (file uploads stored in memory)
├── migrations/             # Knex migration files (run with `npm run migrate`)
├── scripts/                # One-off utility scripts
├── knexfile.js             # Knex configuration for all environments
├── .env.example            # Copy this to .env and fill in your values
└── package.json
```

**Data flow:** `Route → Controller → Service → Model → Database`

---

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create a new customer account |
| POST | `/api/auth/login` | — | Login, returns a JWT |
| POST | `/api/auth/logout` | — | Logout (client discards token) |
| POST | `/api/auth/change-password` | JWT | Change own password |
| GET | `/api/user/currentUser` | JWT | Get current user info |
| GET | `/api/user/allCategories` | — | List service categories |
| GET | `/api/user/providersEachCategory/:id` | — | List providers in a category |
| POST | `/api/user/bookings` | JWT | Create a booking |
| GET | `/api/user/bookings` | JWT | Get own bookings |
| GET | `/api/admin/stats` | JWT + admin | Dashboard statistics |
| POST | `/api/admin/createCategory` | JWT + admin | Create a service category |
| PUT | `/api/admin/updateCategory/:id` | JWT + admin | Update a service category |
| DELETE | `/api/admin/deleteCategory/:id` | JWT + admin | Delete a service category |
| GET | `/api/fixer/homepage` | JWT | Fixer dashboard data |
| GET | `/api/fixer/provider/requests` | JWT | All pending job requests |
| GET | `/api/fixer/provider/requests/:id` | JWT | Single job request detail |
| POST | `/api/fixer/provider/requests/:id/accept` | JWT | Accept and submit proposal |

> **Auth header format:** `Authorization: Bearer <token>`

---

## Development

For setup, running the server, and starting development, see [CONTRIBUTING.md](./CONTRIBUTING.md).

It covers:

- **Development workflow** — start server, make changes, lint, test
- **How to add a new feature** — step-by-step with code examples
- **Code style & best practices** — naming conventions, comments, what to avoid
- **Debugging tips** — logs, database queries, environment variables
- **Pre-commit checklist** — ensure quality before pushing

---

## Deployment

Use the VPS deployment guide in the repository root:

- `../DEPLOY_NGINX_PM2_DEV.md`

It covers:

- Nginx reverse proxy setup
- PM2 backend process management
- Frontend static hosting on the same server
- Auto deployment when `dev` updates
