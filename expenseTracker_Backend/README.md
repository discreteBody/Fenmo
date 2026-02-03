# Expense Tracker Backend

Spring Boot backend for Fenmo Expense Tracker.

Quick start

```bash
cd expenseTracker_Backend
mvn spring-boot:run
```

Notes
- API base path: `/expenses` (see `ExpenseController`).
- Uses Spring Data JPA; the entity is in `src/main/java/.../entity/Expense.java`.
- To build a jar: `mvn package`.
