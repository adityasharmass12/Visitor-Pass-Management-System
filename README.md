# Visitor Pass Management System

MERN stack visitor management system for offices with role-based authentication, visitor registration, appointment approval, QR pass issuance, check-in/check-out tracking, and dashboard exports.

## Project Structure

- `backend/` - Express API, MongoDB models, auth, notifications, QR/PDF generation, seed script
- `frontend/` - Vite + React app with separate dashboards for Admin, Security, Host, and Visitor
- root `package.json` - helper scripts to run backend/frontend from the top level

## Demo Roles from Seed Data

After seeding, you can use these accounts:

- Admin: `admin@demo.com` / `Admin@123`
- Security: `security@demo.com` / `Security@123`
- Employee/Host: `host@demo.com` / `Host@123`
- Visitor: `visitor1@demo.com` / `Visitor@123`

## Backend Setup

1. Go to the backend folder.
2. Copy `.env.example` to `.env` and fill in your values.
3. Install dependencies.
4. Seed the database.
5. Start the API.

```bash
cd backend
npm install
npm run seed
npm run dev
```

From the project root you can also use:

```bash
npm run dev:backend
npm run seed:backend
```

### Backend Environment Variables

- `PORT` - server port, defaults to `5000`
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for JWT signing
- `JWT_EXPIRES_IN` - JWT lifetime, defaults to `7d`
- `CLIENT_URL` - frontend URL, usually `http://localhost:5173`
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - sender name and email
- `UPLOAD_DIR` - upload folder name used for visitor photos

## Frontend Setup

1. Go to the frontend folder.
2. Copy `.env.example` to `.env` if you want a custom API URL.
3. Install dependencies.
4. Start the Vite dev server.

```bash
cd frontend
npm install
npm run dev
```

From the project root you can also use:

```bash
npm run dev:frontend
npm run build:frontend
```

### Frontend Environment Variables

- `VITE_API_URL` - backend API base URL, defaults to `http://localhost:5000/api`

## What The App Covers

- JWT login with role-based access control
- Visitor registration with photo upload
- Host-created appointments with approve/reject flow
- QR pass generation and PDF badge downloads
- Security check-in/check-out using QR scan
- Email notifications through Nodemailer when SMTP is configured
- Admin dashboards for staff, visitor search, logs, and CSV export

## Notes

- If SMTP is not configured, email sends are skipped so the app still runs.
- Visitor photo uploads are saved under `backend/uploads/visitors`.
- The QR scanner uses the camera on the Security dashboard.
