# Redtent

Redtent is a mobile-first, authenticated wellbeing application for menstrual-cycle tracking, daily wellness logging, private journal reflections, and LLM vision-based food observations. The product is designed as a **personal wellness record**, rather than a diagnostic or treatment tool. Every personal record is queried and mutated through the authenticated user context, ensuring that one user’s data is never returned in another user’s workspace.

## Product capabilities

| Area | What Redtent provides |
|---|---|
| Cycle tracking | Period start/end logging, average and median cycle-length calculations, variability, confidence labels, and an estimated phase calendar. |
| Daily wellness | A single daily record for mood, energy, symptoms, sleep quality, and private notes. |
| Journal | Create, update, and delete Markdown-enabled rich-text reflections, tagged with a cycle phase. |
| Food observations | Camera or gallery upload, protected object storage, LLM vision analysis, structured macro estimates, micronutrient highlights, and phase-specific suggestions. |
| Nutrition guidance | Non-prescriptive, phase-aware food ideas with prominent wellness and uncertainty language. |
| Responsive experience | A bottom navigation bar for mobile and a persistent sidebar for desktop. |

## Technology architecture

The application uses a React 19 and TypeScript client with Tailwind CSS, an Express and tRPC server, Drizzle ORM, a managed SQL database, integrated authentication, secure object storage, and a server-side LLM proxy. Credentials remain on the server; the browser never receives storage or model credentials.

| Layer | Responsibility |
|---|---|
| `client/src/pages` | Feature pages for dashboard, cycle calendar, daily log, journal, food, guidance, and profile. |
| `client/src/components/DashboardLayout.tsx` | Authenticated shell that adapts from desktop sidebar to mobile bottom navigation. |
| `server/routers.ts` | Typed tRPC procedures, input validation, authenticated access control, and the food-analysis orchestration. |
| `server/db.ts` | Database helpers that always accept the authenticated numeric `userId`. |
| `server/cycle.ts` | Pure cycle summary and calendar-marking calculations, covered by unit tests. |
| `server/foodAnalysis.ts` | Structured result contract for food-image analysis. |
| `server/storage.ts` | Server-side object storage helper; database rows store only keys and URLs, never image bytes. |
| `drizzle/schema.ts` | User-scoped tables and indexed relations for cycle logs, wellness entries, journal entries, food entries, and preferences. |

## Privacy model

All personal feature procedures use the authenticated user from the server context. Read queries include `userId` conditions, and edits/deletes include both the record identifier and `userId` condition. This double condition prevents a user from reading, altering, or deleting another user’s records by guessing an identifier.

Food image files are uploaded under a user-specific object-storage path. Only the storage key, serving URL, phase, and structured analysis JSON are saved in the database. The server obtains a short-lived signed image URL only for the LLM vision request; the LLM call itself is server-side.

## Cycle and health-safety boundaries

Redtent labels period timing, phase timing, and food observations as **estimates**. Calculations learn from logged history but intentionally use cautious confidence categories when information is limited. The application does not diagnose conditions, prescribe medication, make fertility or pregnancy claims, or treat photo estimates as exact nutritional values.

> If a symptom is severe, persistent, unusual for the user, or concerning, the interface encourages seeking advice from a qualified healthcare professional.

Food analysis is specifically a vision-model observation of visible items. It always returns a macro estimate, micronutrient highlights, phase-specific dietary suggestions, confidence, limitations, and a safety note. Suggestions are optional wellness ideas; they are not medical nutrition therapy.

## Local development

The managed project environment injects the database, authentication, object-storage, and LLM credentials. Do not commit an `.env` file or place secrets in client-side code.

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies. |
| `pnpm drizzle-kit generate` | Generate a migration after editing `drizzle/schema.ts`. |
| `pnpm dev` | Start the local development server. |
| `pnpm check` | Run the TypeScript type check. |
| `pnpm test` | Run the Vitest regression suite. |

When changing the schema, generate the migration, inspect the resulting SQL, and apply it through the project database migration workflow before exercising the new feature. The schema in this repository must remain aligned with the deployed database.

## Verification coverage

The automated test suite covers the cycle-phase boundaries and estimates, historical versus predicted calendar markings, daily wellness date normalization, user ID scoping for destructive procedures, and strict validation of LLM nutrition-analysis output. Run `pnpm test` and `pnpm check` before creating a delivery checkpoint.

## Deployment

Create a project checkpoint after validation. From the project management interface, use the **Publish** button to deploy the checkpoint. The managed platform handles runtime configuration and injected credentials; no external hosting configuration is required for the default deployment path.
