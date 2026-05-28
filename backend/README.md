# Zargo Backend

Production-ready Node.js + Express + MongoDB backend for the Zargo EV Dashboard.

## Stack

- Node.js / Express
- MongoDB Atlas + Mongoose
- JWT auth (bcryptjs)
- dotenv, cors

## Setup

```bash
cd backend
cp .env.example .env   # fill MONGO_URI + JWT_SECRET
npm install
npm run seed           # creates admin + staff and demo data
npm run dev            # http://localhost:5000
```

## Scripts

- `npm run dev` — start with nodemon
- `npm start` — production start
- `npm run seed` — wipe + reseed the database

## Default Credentials

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Admin | admin@zargo.in  | Zargo@123  |
| Staff | staff@zargo.in  | Staff@123  |

## API

Base: `/api`

### Auth
- `POST /auth/login` — `{ email, password }` → `{ token, user }`
- `GET  /auth/me`
- `POST /auth/logout`

### Vehicles  *(admin write, all read)*
- `GET /vehicles`, `GET /vehicles/:id`
- `POST /vehicles`, `PATCH /vehicles/:id`, `DELETE /vehicles/:id`

### Bookings
- `GET /bookings`, `GET /bookings/:id`
- `POST /bookings`, `PATCH /bookings/:id`, `DELETE /bookings/:id`

### Alerts
- `GET /alerts`, `POST /alerts`
- `PATCH /alerts/:id/read`, `DELETE /alerts/:id`

### Employees *(admin only)*
- `GET /employees`, `POST /employees`
- `PATCH /employees/:id`, `DELETE /employees/:id`

### Dashboard
- `GET /dashboard/stats`

## Frontend Integration

In the frontend `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```