# Fenmo — Expense Tracker

>A lightweight expense tracker with a React + Vite frontend and a Spring Boot backend.

## Overview
- Simple UI to add, edit, filter, and delete expenses.
- Persistent backend powered by Spring Data JPA.
- Mobile-friendly responsive layout and quick local development setup.

## Features
- Add expenses with amount, category, description, and date.
- Edit and delete existing expenses.
- Filter by category and sort by date (newest/oldest).
- Idempotent create endpoint (prevents duplicate submissions when an idempotency key is provided).
- Clean, centered UI with horizontal filter chips.

## Tech Stack
- Frontend: React (Vite), plain CSS (src/index.css), Sonner for toasts
- Backend: Spring Boot, Spring Data JPA, Maven

## Quick Start

Backend (run from `expenseTracker_Backend`):

```bash
cd expenseTracker_Backend
mvn spring-boot:run
```

Frontend (run from `expense-tracker`):

```bash
cd expense-tracker
npm install
npm run dev
```

The frontend expects the API base at `http://localhost:8080/expenses` by default. You can override this in the frontend with the `VITE_API_BASE` environment variable (e.g. `VITE_API_BASE=http://localhost:8080/expenses`).

## API Endpoints (Backend)
Base path: `/expenses`

- GET `/expenses`
  - Query params:
    - `category` (optional) — filter by category (e.g. `Food`).
    - `sort` (optional, default `date_desc`) — `date_desc` or `date_asc`.
  - Response: JSON array of expense objects.

- POST `/expenses`
  - Body: JSON Expense object. If an `idempotencyKey` is included and matches an existing record, the existing resource is returned (200). Otherwise a new expense is created (201).
  - Response: created or existing Expense object.

- PUT `/expenses/{id}`
  - Path param: `id` — expense id to update.
  - Body: JSON with updatable fields (`amount`, `category`, `description`, `date`).
  - Response: updated Expense (200) or 404 if not found.

- DELETE `/expenses/{id}`
  - Path param: `id` — expense id to delete.
  - Response: 204 No Content on success, 404 if not found.

## Expense JSON (example)

```json
{
  "id": 123,
  "amount": 25.5,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-02-03",
  "idempotencyKey": "optional-uuid-string"
}
```

## Development Notes
- The backend allows CORS from the Vite dev servers (`http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`) for local development. Adjust `@CrossOrigin` in `ExpenseController` for production.
- Frontend files are under `expense-tracker/src` (notably `ExpenseTracker.jsx`, `ExpenseForm.jsx`, `ExpenseTable.jsx`).
- If you need the frontend to point to a different API host, set `VITE_API_BASE` before starting Vite.

## Next Steps / Ideas
- Add tests (unit and integration) for the backend repository and controller.
- Add pagination to the GET endpoint for large datasets.
- Add authentication if you need multi-user support.

---

