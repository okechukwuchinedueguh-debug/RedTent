# Redtent

Redtent is a mobile-first, authenticated wellbeing application for menstrual-cycle tracking, daily wellness logging, private journal reflections, and LLM vision-based food observations. The product is designed as a **personal wellness record**, rather than a diagnostic or treatment tool. Every personal record is queried and mutated through the authenticated user context, ensuring that one user’s data is never returned in another user’s workspace.

## Product capabilities

| Area | What Redtent provides |
|---|---|
| Cycle tracking | Period start/end logging, average and median cycle-length calculations, variability, confidence labels, and an estimated phase calendar. |
| Daily wellness | A single daily record for mood, energy, symptoms, sleep quality, and private notes. |
| Journal | Create, update, and delete Markdown-enabled rich-text reflections, tagged with a cycle phase. |
| Food Lens | Camera or gallery capture with Before You Eat and I Ate This framing, protected object storage, LLM vision analysis, user corrections, structured macro estimates, micronutrient highlights, and phase-specific suggestions. |
| Nourish | Non-prescriptive, phase-aware food ideas with prominent wellness and uncertainty language. |
| Your Patterns and Tomorrow | Deterministic observations and an on-demand next-day briefing derived only from the user’s saved records. They state uncertainty and do not diagnose or claim causation. |
| Ask Redtent | A contextual AI surface where the user explicitly chooses whether recent wellness, Food Lens, and Your Space data is included for a single question. Conversation messages are kept in browser session state, not persisted as a new personal-data record. |
| Personal preferences | Optional food-culture, preference, restriction, and wellness-goal fields that help Food Lens and Ask Redtent produce more relevant general guidance. |
| Account identity | An optional unique Redtent username and replaceable profile photo, with a private fallback avatar when no image is chosen. |
| Responsive experience | A bottom navigation bar for mobile and a persistent sidebar for desktop. |

## Technology architecture

The application uses a React 19 and TypeScript client with Tailwind CSS, an Express and tRPC server, Drizzle ORM, a managed SQL database, integrated authentication, secure object storage, and a server-side LLM proxy. Credentials remain on the server; the browser never receives storage or model credentials.

| Layer | Responsibility |
|---|---|
| `client/src/pages` | Feature pages for the personalized dashboard, cycle calendar, daily log, Your Space, Food Lens, Nourish, Your Patterns, Ask Redtent, and profile. |
| `client/src/components/DashboardLayout.tsx` | Authenticated shell that adapts from desktop sidebar to mobile bottom navigation. |
| `server/routers.ts` | Typed tRPC procedures, input validation, authenticated access control, and the food-analysis orchestration. |
| `server/db.ts` | Database helpers that always accept the authenticated numeric `userId`. |
| `server/cycle.ts` | Pure cycle summary and calendar-marking calculations, covered by unit tests. |
| `server/patterns.ts` | Deterministic, non-diagnostic observation and Tomorrow briefing helpers that work only with the current user’s saved records. |
| `server/askRedtent.ts` | Safety-first, context-limited system-prompt builder for Ask Redtent. |
| `server/foodAnalysis.ts` | Structured result contract for food-image analysis. |
| `server/storage.ts` | Server-side object storage helper; database rows store only keys and URLs, never image bytes. |
| `drizzle/schema.ts` | User-scoped tables and indexed relations for cycle logs, wellness entries, journal entries, food entries, and preferences. |

## Privacy model

All personal feature procedures use the authenticated user from the server context. Read queries include `userId` conditions, and edits/deletes include both the record identifier and `userId` condition. This double condition prevents a user from reading, altering, or deleting another user’s records by guessing an identifier.

Food image files are uploaded under a user-specific object-storage path. Only the storage key, serving URL, phase, and structured analysis JSON are saved in the database. The server obtains a short-lived signed image URL only for the LLM vision request; the LLM call itself is server-side.

Profile photos follow the same user-specific storage approach. Redtent accepts only JPEG, PNG, or WebP files up to 2 MB, stores only the generated object key and serving URL in the user’s own profile row, and scopes every identity mutation to the authenticated user. Usernames are normalized to lowercase characters, numbers, and underscores, then protected by a unique database index.

## Cycle and health-safety boundaries

Redtent labels period timing, phase timing, and food observations as **estimates**. Calculations learn from logged history but intentionally use cautious confidence categories when information is limited. The application does not diagnose conditions, prescribe medication, make fertility or pregnancy claims, or treat photo estimates as exact nutritional values.

> If a symptom is severe, persistent, unusual for the user, or concerning, the interface encourages seeking advice from a qualified healthcare professional.

Food Lens is specifically a vision-model observation of visible items. It always returns a macro estimate, micronutrient highlights, phase-specific dietary suggestions, confidence, limitations, and a safety note. The user can correct visible-food labels on a saved entry. Suggestions are optional wellness ideas; they are not medical nutrition therapy.

Your Patterns is intentionally conservative. It only reflects explicitly logged, user-scoped records and never creates an observation until enough related entries exist. Tomorrow is an on-demand briefing, not an automatic notification service. Recurring notifications, background reports, and end-user schedule settings require a separately selected scheduling model and explicit product decisions before implementation.

Ask Redtent accepts a one-off user question and lets the user decide whether wellness check-ins, Food Lens snapshots, and/or recent Your Space entries are included as context. It is instructed to avoid diagnosis, medical treatment, fertility or pregnancy claims, eating-disorder inference, and ungrounded personal-data claims.

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

The automated test suite covers the cycle-phase boundaries and estimates, historical versus predicted calendar markings, daily wellness date normalization, user ID scoping for destructive procedures, strict validation of LLM nutrition-analysis output, safe deterministic pattern observations, Tomorrow safety language, the Ask Redtent context prompt, unique username handling, and user-scoped profile-photo storage. Run `pnpm test` and `pnpm check` before creating a delivery checkpoint.

## Deployment

Create a project checkpoint after validation. From the project management interface, use the **Publish** button to deploy the checkpoint. The managed platform handles runtime configuration and injected credentials; no external hosting configuration is required for the default deployment path.
