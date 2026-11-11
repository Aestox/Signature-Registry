# Electronic Signature Registry

A web application for tracking electronic signature and machine-readable power
of attorney (PoA) expirations. The public registry exposes only approved fields
and excludes former employees. Administrators can view private data and manage
records. Public sign-up is disabled; the application does not create action
logs.

For Russian instructions, see [README.md](README.md).

## Features

- Public registry with search and pagination in pages of 10 records.
- Admin dashboard with sign-in, CRUD operations, search, and the same pagination.
- Clear visual status for expired and upcoming signature/PoA dates.
- English and Russian UI at `/en` and `/ru`. The root URL `/` redirects to
  English.
- Optional custom record fields visible only to administrators.

## Tech stack

- **Next.js App Router**, **React**, **TypeScript**
- **Tailwind CSS 4** and **shadcn/ui-style components** built on **Radix UI**
- **PostgreSQL** as the application database
- **Drizzle ORM** for typed database access; **Drizzle Kit** for migrations
- **Better Auth** for administrator sign-in and sessions
- **next-intl** for UI localization

## Requirements

- Node.js 20.9 or newer and npm
- Docker with Docker Compose for local PostgreSQL
- For an external database, a reachable PostgreSQL instance; local Compose is
  not required

Run all commands below from the repository root.

## Configure and run locally

1. Create a local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   Open `.env` and set your own values:

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | PostgreSQL connection string used by the app |
   | `DIRECT_URL` | Optional direct or session-pooler URL for Drizzle migrations; defaults to `DATABASE_URL` |
   | `POSTGRES_DB` | Database name for local Docker Compose |
   | `POSTGRES_USER` | Local database user |
   | `POSTGRES_PASSWORD` | Local database password; it must match the password in `DATABASE_URL` |
   | `BETTER_AUTH_SECRET` | Better Auth secret; use a random value of at least 32 characters |
   | `BETTER_AUTH_URL` | App base URL; locally this is usually `http://localhost:3000` |
   | `ADMIN_NAME` | First administrator's name |
   | `ADMIN_EMAIL` | First administrator's email |
   | `ADMIN_PASSWORD` | First administrator's password, at least 14 characters |

   If the database password contains special characters, URL-encode them in
   `DATABASE_URL`. Do not commit `.env` or reuse local secrets in production.

2. Start local PostgreSQL and install dependencies:

   ```powershell
   docker compose up -d postgres
   npm ci
   ```

   Compose publishes PostgreSQL only on `127.0.0.1:5432` and stores its data in
   a dedicated Docker volume.

3. Apply database migrations:

   ```powershell
   npm run db:migrate
   ```

4. Optional: add fictional data for local development:

   ```powershell
   npm run db:seed-demo
   ```

   The seed creates 21 demo records, is restricted to local PostgreSQL
   addresses, and is idempotent. Running it again does not create duplicates.
   Do not run it against a production database.

5. Create the first administrator:

   ```powershell
   npm run admin:create
   ```

   Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before running the
   command. Creating a user that already exists fails.

6. Start the app:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:3000`; the default redirects to `/en`. Admin sign-in
   is available at `/en/admin/login` or `/ru/admin/login`.

Stop the local database with `docker compose down`. Do not add `-v` if you want
to preserve the database volume.

## PostgreSQL and Drizzle

The database schema is defined in `src/lib/db/schema.ts`. The app's database
connection is configured in `src/lib/db/client.ts`. `drizzle.config.ts` points
Drizzle Kit to the schema, the `drizzle/` migration directory, and `DIRECT_URL`
(or `DATABASE_URL` when `DIRECT_URL` is unset). The schema contains the
registry and Better Auth tables.

Typical schema-change workflow:

1. Update the typed schema in `src/lib/db/schema.ts`.
2. Generate an SQL migration:

   ```powershell
   npm run db:generate
   ```

3. Review the generated SQL under `drizzle/`, then apply migrations:

   ```powershell
   npm run db:migrate
   ```

4. Commit new migrations with the schema change. Do not edit migrations that
   have already been applied; create a new migration instead.

For an external PostgreSQL instance, including a managed service, set
`DATABASE_URL` to its connection string, configure the correct
`BETTER_AUTH_URL`, and apply migrations before starting the app. In production,
set secrets in the hosting provider's environment configuration rather than in
`.env`. Keep the database off the public internet.

## Supabase

Supabase can be used as managed PostgreSQL without switching to Supabase Auth:
the app connects to the database server-side through Drizzle, while Better Auth
continues to handle administrator sign-in. The app does not need the Supabase
SDK, a public API key, or the project URL.

1. Create a Supabase project and copy its connection strings from the
   **Connect** panel.
2. For serverless hosting, use the **transaction pooler** string as
   `DATABASE_URL`. The PostgreSQL client disables prepared statements to support
   this mode.
3. Set `DIRECT_URL` to a direct connection string for Drizzle migrations. If
   the environment does not support IPv6, use the session pooler. Leave
   `DIRECT_URL` empty for local development.
4. Configure `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` for the deployed app,
   then run migrations and create an administrator.

Use the values from the Supabase dashboard. Do not commit passwords or
connection strings, and never expose `DATABASE_URL` to client-side code. See
[Drizzle with Supabase](https://supabase.com/docs/guides/database/drizzle) and
[connecting to PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Demo data and JSON import

`npm run db:seed-demo` is for local PostgreSQL only. The demo records are
synthetic and do not contain real personal data.

To import registry records, prepare a JSON array in the format accepted by
`scripts/import-registry.ts`, for example:

```json
[
  {
    "id": 1,
    "nameFull": "Example record",
    "email": null,
    "post": null,
    "depo": null,
    "certificate_type": null,
    "serial_number": null,
    "certificate_status": null,
    "release_date": null,
    "end_date": null,
    "certification_center": null,
    "platform": null,
    "mchd": null,
    "release_date_mchd": null,
    "end_date_mchd": null,
    "contract": null,
    "place_contur_extern": 0,
    "fired": 0,
    "notes": null
  }
]
```

Then run:

```powershell
npm run db:import -- "C:\secure-path\registry.json"
```

The field names must match the format parsed by
`scripts/import-registry.ts`. Dates must be `YYYY-MM-DD` or `null`; boolean
fields accept `0`/`1` or `false`/`true`. Imports preserve IDs and do not
overwrite existing records; only registry records are imported. Keep the file
outside the repository and delete it after verifying the import.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check TypeScript |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed-demo` | Add local demo records |
| `npm run admin:create` | Create an administrator from environment variables |
| `npm run db:import -- <path>` | Import records from JSON |

## Main directories

- `src/app/[locale]` — public and admin pages with locale-prefixed URLs
- `src/components` — tables, forms, search, and UI components
- `src/lib/db` — Drizzle connection and PostgreSQL schema
- `src/i18n` and `messages` — localization setup and translations
- `drizzle` — SQL migrations and migration journal
- `scripts` — admin creation, demo seeding, and JSON import

Add new interface strings to both `messages/en.json` and `messages/ru.json`.

## License

This project is distributed under the [MIT License](LICENSE).
