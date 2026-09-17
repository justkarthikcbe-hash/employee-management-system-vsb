# Dayflow HRMS

A full-stack Human Resource Management System prototype.

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT with role-based access control (`employee` / `admin`)

The landing page (`/`) is a cinematic, scroll-driven Three.js experience adapted
from the provided UX brief — an abstract bronze "flow knot" sculpture orbits as
you scroll, with a liquid-metal background shader that shifts from bronze to
sapphire, forge-spark particles, a custom cursor, and per-letter title reveals.
Everything past `/login` and `/register` is the functional HR application.

## Project structure

```
dayflow-hrms/
├── backend/          Express API + MongoDB models
│   ├── config/        DB connection
│   ├── controllers/    Route handlers
│   ├── middleware/     JWT auth + role guard
│   ├── models/         Mongoose schemas
│   ├── routes/         Express routers
│   ├── seed.js          Creates a demo admin + employee account
│   ├── server.js         App entrypoint
│   └── .env.example
└── frontend/         React app (Vite)
    ├── src/
    │   ├── api/           Axios client with JWT interceptor
    │   ├── components/     Shared UI (layout, protected route)
    │   ├── context/         AuthContext
    │   ├── pages/            Employee-facing pages + Landing/Login/Register
    │   │   └── admin/         Admin-facing pages
    │   ├── styles/            Global + landing-page CSS
    │   └── utils/              Badge/format helpers
    └── vite.config.js
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongod` running on `27017`) or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dayflow_hrms   # or your Atlas URI
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Seed a demo admin and employee account (optional but recommended for first run):

```bash
npm run seed
```

This creates:
- **Admin:** `admin@dayflow.com` / `Admin@123`
- **Employee:** `employee@dayflow.com` / `Employee@123`

Start the API:

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`.

> Note: even without seeding, the **very first account you register** through
> the app automatically becomes the admin. Every account after that registers
> as an employee (self-serve signups can never grant themselves admin).

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Vite is configured to proxy `/api`
requests to `http://localhost:5000`, so no CORS setup is needed in dev.

## 3. Using the app

1. Visit `http://localhost:5173/` for the landing page — scroll to explore.
2. Click **Get Started** (or go to `/login`) and sign in with the seeded
   accounts, or register a new one.
3. **Employees** land on `/dashboard` and can manage their profile, check in
   and out, apply for leave, and view read-only payslips.
4. **Admins** land on `/admin` and can search/edit any employee, view
   organization-wide attendance, approve or reject leave requests, and
   publish monthly payroll.

## API overview

All endpoints are prefixed with `/api` and (except `/auth/register` and
`/auth/login`) require an `Authorization: Bearer <token>` header.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account (first ever user becomes admin) |
| POST | `/auth/login` | Public | Sign in, returns a JWT |
| GET | `/auth/me` | Auth'd | Current user + employee profile |
| GET/PUT | `/employees/me` | Employee | View/edit own profile (limited fields) |
| GET | `/employees` | Admin | List/search all employees |
| GET/PUT | `/employees/:id` | Admin | View/edit any employee (all fields) |
| PUT | `/employees/:id/status` | Admin | Enable/disable an account |
| POST | `/attendance/check-in` \| `/check-out` | Employee | Mark today's attendance |
| GET | `/attendance/me` | Employee | Own attendance history |
| GET | `/attendance` | Admin | All attendance, filterable by date/employee |
| POST | `/leaves` | Employee | Apply for leave |
| GET | `/leaves/me` | Employee | Own leave requests |
| GET | `/leaves` | Admin | All leave requests, filterable by status |
| PUT | `/leaves/:id/decision` | Admin | Approve/reject with an optional comment |
| GET | `/payroll/me` | Employee | Own payslip history (read-only) |
| GET | `/payroll` | Admin | All payroll records |
| POST | `/payroll` | Admin | Create/update a month's payroll for an employee |

## Notes on the design

- Attendance status is computed from hours between check-in and check-out
  (≥6h = Present, ≥3h = Half-day, otherwise Absent) — tune the thresholds in
  `backend/controllers/attendanceController.js`.
- Approving a leave request automatically deducts the requested day count
  from the employee's leave balance for that leave type.
- Passwords are hashed with bcrypt; nothing sensitive is ever returned from
  the API (`User.toSafeJSON()` strips the hash).
- The landing page's 3D sculpture is procedural (a Three.js `TorusKnotGeometry`)
  rather than a loaded model file, so the project has zero external asset
  dependencies and works fully offline once `npm install` has run.

## Production build

```bash
cd frontend
npm run build      # outputs to frontend/dist
```

Serve `frontend/dist` with any static host, and point it at your deployed
backend by setting the frontend's proxy/base URL or an `VITE_API_URL` env
var if you extend `src/api/axios.js` to use one.
