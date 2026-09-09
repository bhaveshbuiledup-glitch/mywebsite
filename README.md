# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# BizGrow

BizGrow is a React + Vite digital marketing assessment platform with an optional Express/Mongoose API for storing reports in MongoDB Atlas.

## Run the frontend

```bash
npm install
npm run dev
```

## Run frontend and API together

1. Copy `.env.example` to `.env`.
2. Replace `<db_password>` with a rotated MongoDB Atlas database password. Do not commit `.env`.
3. Start both services:

```bash
npm run dev:full
```

The API runs on `http://localhost:5000`; Vite proxies `/api` requests to it. Report submissions save to MongoDB when connected and keep a localStorage fallback for offline development.

## API

- `GET /api/health` checks API and MongoDB connection status.
- `POST /api/reports` saves a report and its contact details.
- `GET /api/reports?email=...` retrieves reports for an email address.

Never place the MongoDB URI or password in React source code or commit it to GitHub. Since the database password was shared in chat, rotate it in MongoDB Atlas before using the connection string.
