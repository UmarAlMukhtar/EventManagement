# Event Management System

Events, registration, attendance, and feedback with a **Java 17 / Spring Boot** REST API, **MariaDB**, and the existing **React 19 / Vite** frontend.

## Requirements

- JDK 17 or newer
- MariaDB 10.6 or newer (default local port: 3307)
- Node.js 22 and npm for the frontend
- Maven 3.6.3+, or use the included Maven Wrapper

## Backend setup

For a **new database**, create it and import the schema:

```sh
mariadb -h 127.0.0.1 -P 3307 -u root -p -e 'CREATE DATABASE IF NOT EXISTS event_management;'
mariadb -h 127.0.0.1 -P 3307 -u root -p event_management < backend/db.sql
```

For an **existing installation**, keep your database. See [the migration notes](backend/MIGRATION.md) before switching runtimes. Existing tables, IDs, foreign keys, and bcrypt password hashes remain compatible.

```sh
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT_SECRET.
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`. Installed Maven also works with `mvn spring-boot:run`.

The API runs at `http://localhost:3000`. `GET /api/status` returns its status. Start from `backend/` to load its `.env` file, using unquoted `KEY=value` lines. Deployment environment variables work too; `DB_URL` can override the complete JDBC URL.

No default admin account/password is installed. Register normally, then promote the intended account with an authorized database connection:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Log in again after changing roles so the frontend receives an updated token.

## Frontend setup

```sh
cd frontend
npm ci
npm run dev
```

The existing `frontend/.env` uses `VITE_API_URL=http://localhost:3000`. Open `http://localhost:5173`. Configure backend `CORS_ORIGINS` if the frontend runs elsewhere; separate multiple origins with commas.

## Build and test

```sh
cd backend
./mvnw verify
java -jar target/event-management-api-1.0.0.jar
```

Integration tests default to an isolated H2 database in MySQL compatibility mode. Run the same suite against a **dedicated disposable MariaDB test database** with:

```sh
TEST_DB_URL=jdbc:mariadb://127.0.0.1:3307/event_management_test \
TEST_DB_USER=root TEST_DB_PASSWORD=your-test-password ./mvnw verify
```

The test database must already exist. **Tests clear application records in that database. Never point `TEST_DB_URL` at a development or production database.** GitHub Actions tests both H2 and MariaDB.

## API

Protected endpoints require `Authorization: Bearer <token>`. Tokens contain `user_id`, `role`, `iat`, and a one-hour `exp`. Errors use `{ "error": "message" }`.

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/signup` | Public; participant/coordinator |
| POST | `/api/auth/login` | Public; email and/or username (user ID) |
| GET | `/api/users` | Public; password hashes omitted |
| GET | `/api/users/profile` | Signed-in user |
| GET | `/api/users/{id}` | Public; password hash omitted |
| POST | `/api/users` | Public signup alias; ID generated, password hashed |
| PUT, DELETE | `/api/users/{id}` | Self/admin; only admin can change roles |
| GET | `/api/events` | Public |
| GET | `/api/events/{id}` | Public; retains the original array response |
| GET | `/api/events/coordinator/{id}` | Public |
| POST | `/api/events` | Admin/coordinator; creator becomes coordinator |
| PUT, DELETE | `/api/events/{id}` | Owning coordinator/admin |
| POST | `/api/registrations` | Signed-in user; `{ "event_id": "e001" }` |
| GET | `/api/registrations/my-registrations` | Signed-in user |
| GET | `/api/registrations/check/{event_id}` | Signed-in user |
| GET | `/api/registrations/user/{user_id}` | Admin |
| GET | `/api/registrations/event/{event_id}` | Owning coordinator/admin |
| PUT, DELETE | `/api/registrations/{reg_id}` | Admin |
| POST | `/api/attendance` | Owning coordinator/admin; upserts by registration |
| GET | `/api/attendance/registration/{reg_id}` | Participant concerned, owning coordinator, or admin |
| GET | `/api/attendance/user/{user_id}` | Self/admin |
| PUT | `/api/attendance/{att_id}` | Owning coordinator/admin |
| POST | `/api/feedback` | Signed-in user; their own registration |
| GET | `/api/feedback/registration/{reg_id}` | Public |
| GET | `/api/feedback/event/{event_id}` | Public |
| GET | `/api/feedback/user/{user_id}` | Public |

Feedback accepts the frontend payload `{ "event_id": "e001", "feedback": "Great event" }` or `{ "reg_id": "r001", "rating": 5, "comment": "Great event" }`. Rating is optional (1–5); a rating or comment is required. Registration creation returns the actual string `registration_id`.

## Structure

```text
backend/
  pom.xml                       Maven / Spring Boot dependencies
  mvnw, mvnw.cmd                Maven Wrapper
  db.sql                        Non-destructive application schema
  .env.example                  Configuration template
  MIGRATION.md                  Cutover, compatibility, rollback
  src/main/java/com/eventmanagement/
    api/                        Controllers, validation, JSON errors
    auth/                       HS256 JWT and endpoint authorization
    config/                     CORS and bcrypt
    data/                       JDBC queries and ID allocation
    service/                    Transactional business logic
  src/main/resources/
    application.properties
    id-sequences.sql            Additive ID counters
  src/test/                     API/database integration tests
frontend/                       Existing React/Vite application
```

The unmounted Node `EventCoordinator` controller/model had no API routes or schema table. Events continue to use the single `events.coordinator_id` field.
