# Migrating from Node.js to Java

## Cutover

1. Back up MariaDB and retain the old deployment/ref for rollback.
2. Install JDK 17+. Keep your existing database and application tables.
3. Stop Node before starting Java on port 3000. Do not run both as writers: Node does not use the Java ID-counter locks.
4. Retain `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET` in `backend/.env`, or set process environment variables. Use unquoted `KEY=value` lines. Start from `backend/` to load `.env`. Set `CORS_ORIGINS` to the frontend origin(s).
5. Run `./mvnw verify`, then `./mvnw spring-boot:run`. Windows uses `mvnw.cmd`. Alternatively, run the built JAR with `java -jar target/event-management-api-1.0.0.jar`.
6. Verify `/api/status`, login, profile, event creation, registration, attendance, and feedback with the existing frontend.

Startup only creates/seeds `id_sequences`. Counters start after the highest existing numeric ID in each table and never move backward. Existing application tables/data are not changed by initialization. The application database user needs `CREATE` for the counter table on first startup, plus normal CRUD permissions. An operator can pre-create/seed it with `src/main/resources/id-sequences.sql` instead.

Application tables must use InnoDB (MariaDB's default) for transactions and row locks. `db.sql` is for bootstrapping missing tables and now preserves existing tables/records.

## Compatibility

- The React frontend is unchanged, including its API URL and paths.
- MariaDB tables, foreign keys, cascading deletes, string IDs, and snake_case JSON fields remain.
- Existing bcrypt `$2a$`/`$2b$` hashes work without password resets.
- Unexpired HS256 JWTs work with the same secret, `user_id`, `role`, and `exp`. New tokens expire after one hour. Authenticated requests check the user's current database role.
- Public event/user/feedback reads remain available. User responses omit password hashes.
- Single-event success responses remain arrays. Missing records return JSON 404 errors.

## Intentional fixes

- Signup and `/api/users` both hash passwords, generate IDs, and prevent public admin creation. `/api/users` no longer accepts caller-assigned IDs or pre-hashed passwords.
- User updates preserve omitted fields. Only admins can change roles or manage other accounts.
- Coordinators can manage only their own events and their events' registration/attendance records. Admins can manage all events.
- Feedback submission requires authentication and ownership. Both `{event_id, feedback}` from the frontend and `{reg_id, rating, comment}` from the older API are accepted. Cancelled registrations cannot submit feedback.
- Registration creation returns the real string `registration_id`, replacing Node's unrelated MySQL `insertId` value.
- Joined registration responses keep the original `title/date/venue` and `name/email` fields and add the `event_*`/`user_*` aliases the frontend displays.
- IDs use database row locks in the same transaction as each insert. Concurrent Java instances can create records safely. Attendance upserts lock the registration row.
- Validation returns JSON 400 errors, constraint conflicts return 409, and unexpected errors do not reveal SQL internals.

The old `EventCoordinator` controller/model was unmounted and had no schema table. Each event continues to use the single `events.coordinator_id` field.

## Rollback

Stop Java and deploy the previous Node revision (`c6fa2dfc513166f46b62653dce0245b8cbcc60e3`). Core schemas, passwords, and IDs remain compatible. Leave `id_sequences` in place. Never run both runtimes as writers together. The next Java startup advances counters for records created after rollback.

Rotating `JWT_SECRET` invalidates old tokens; clients must log in again. Keep real database passwords/JWT secrets out of source control.
