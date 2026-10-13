# AlumniConnect Frontend

Web client for the AlumniConnect platform, built with React, Vite, React Router, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:8080`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`. API requests to `/api` and `/uploads` are proxied to `http://localhost:8080` via `vite.config.js`.

## Production Build

```bash
npm run build
npm run preview
```

## Directory Layout

- `src/api/` — Axios client configuration and API modules grouped by domain
- `src/components/` — Reusable UI elements, layout shells, and route guards
- `src/context/` — Authentication state provider (`AuthContext`)
- `src/pages/` — Route views organized by role (`student`, `alumni`, `admin`) and feature (`jobs`, `events`, `posts`, `messages`)
- `src/utils/` — Date/text formatters, form validators, and shared constants
