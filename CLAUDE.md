# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a **pnpm + Turborepo** workspace. Run commands from the repo root unless filtering by workspace.

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Dev all workspaces | `pnpm dev` |
| Dev only web app | `pnpm --filter @mallhub/web run dev` |
| Build all | `pnpm build` |
| Lint all | `pnpm lint` |
| Format all | `pnpm format` |
| Type-check all | `pnpm type-check` |
| Run DB migrations | `pnpm --filter @mallhub/web run prisma:migrate` |
| Seed database | `pnpm --filter @mallhub/web run prisma:seed` |
| Compile i18n | `pnpm --filter @mallhub/web run i18n:compile` |

**No test suite is configured.** Mandatory validation before finishing changes: `pnpm format` → `pnpm lint` → `pnpm type-check`.

## Architecture

**Monorepo workspaces:**
- `apps/web` — React Router v7 SSR app (frontend + backend in one process)
- `packages/ui` — shared component library (`@mallhub/ui`), shadcn-based
- `packages/notifications` — Redis + BullMQ email queue infrastructure (`@mallhub/notifications`)

**Infrastructure (Docker Compose):** PostgreSQL 17, Redis 7, MinIO.

### Request flow

```
Browser → React Router SSR → tRPC handler (api/trpc/*)
                            → Better Auth handler (api/auth/*)
                            → UI routes (:locale?/...)
```

- `apps/web/app/routes.ts` — route wiring; API routes live outside the locale prefix, UI routes inside `prefix(':locale?')`
- `apps/web/app/features/.server/` — all server-only code (Prisma, tRPC router, auth, env)
- `apps/web/app/features/<feature>/` — UI components, form modules, client hooks per feature

### Auth & authorization

- **Better Auth** handles session/auth endpoints with `admin` + `organization` plugins
- **CASL** enforces ability-based access from session role (`CUSTOMER`, `ADMIN_LOCAL`, `ADMIN_CC`, `ADMIN_PLATFORM`)
- Role constants and ability definitions are centralized in `better-auth-access-control.lib.ts` — use `appRoles` constants, not string literals
- tRPC procedures gate access via `procedures.public` / `procedures.auth` / role/ability procedures from `trpc.init.ts`
- Three files must stay aligned: `better-auth-server.lib.ts`, `app-ability.lib.ts`, `trpc.init.ts`

### Data layer

- Prisma 7 + PostgreSQL; schema at `apps/web/prisma/schema.prisma`
- Generated client at `apps/web/app/features/.server/prisma/generated/` — **do not edit manually**
- Runtime singleton in `prisma.server.ts`

### i18n

- Source files: `messages/es.json` and `messages/en.json` (base locale: Spanish)
- Compiled output at `apps/web/app/paraglide/` — **do not edit manually**; regenerate with `pnpm --filter @mallhub/web run i18n:compile`
- Locale middleware in `root.tsx`; use `localizeHref(...)` for all internal navigation links
- In server code, pass request locale to message functions via `getLocaleFromAsyncStorage()`

## Key conventions

### tRPC procedures

New server procedures go in `.server/<feature>/*.query.ts` or `*.mutation.ts`, then are wired into `trpc.router.ts`. Preserve the existing error format that maps `ZodError` → `error.data.zodError` for TanStack Form field errors.

### Forms

Forms use TanStack Form with a dedicated `*.form.ts` module. Every form module defines:
- `createFormHookContexts()` + `createFormHook(...)`
- `formOptions(...)` with `defaultValues`
- A Zod `state` schema + `data` schema + `z.codec(stateSchema, dataSchema, { decode, encode })` as `validators.onSubmit`

**State update rules:**
- Direct UI input events → `field.handleChange` inside `form.Field`
- Imperative/async transitions (upload complete, cross-field orchestration) → `form.setFieldValue`
- Never use `onChange={(e) => form.setFieldValue(...)}` when already inside `form.Field`
- Avoid broad `form.Subscribe` selectors over large state objects; use narrow selectors or `form.Field` directly

Field rendering follows shadcn composition: `Field` → `Label`/`FieldLabel` → control → `FieldError`. Every field must expose `isInvalid` from field meta, set `data-invalid`/`aria-invalid`, and render `FieldError`. All validation messages use Paraglide `m.*` keys — no hardcoded strings.

### UI components

- Prefer `@mallhub/ui` components over raw HTML equivalents
- Use Hugeicons (`@hugeicons/*`) for icons
- Use semantic theme tokens from `packages/ui/src/global.css` — avoid raw Tailwind color utilities like `text-blue-500`

### Notifications

Email notifications are enqueued (fire-and-forget) through `notification-email-dispatcher.lib.ts` using `@mallhub/notifications` primitives. Never block auth flows waiting for SMTP delivery.

### Environment variables

Required vars are enforced at startup in `server-env.lib.ts` and `client-env.lib.ts`. Do not use `process.env.X ?? 'fallback'` in feature code. When adding a new env var, update `server-env.lib.ts`, `.env.example`, and the relevant docker-compose environment blocks together.

### Imports

Use the `@/` path alias for imports inside `apps/web` instead of relative paths. Generated artifacts (`paraglide/*`, `prisma/generated/*`) are always excluded from manual edits.

## Documentation

Key guides in `docs/`:
- `trpc.md` — tRPC structure and server error localization pattern
- `forms.md` — TanStack Form detailed guide
- `style.md` — Design and code style conventions
- `roles-permissions-organizations-guide.md` — Auth architecture deep dive
- `paraglide-i18n-quick-guide.md` — i18n setup walkthrough
