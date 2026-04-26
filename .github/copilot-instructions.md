# Copilot Instructions for MallHub

## Build, lint, type-check, and test commands

This is a **pnpm + Turborepo** workspace.

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Run all apps/packages in dev | `pnpm dev` |
| Build all workspaces | `pnpm build` |
| Lint all workspaces | `pnpm lint` |
| Type-check all workspaces | `pnpm type-check` |
| Format all workspaces | `pnpm format` |
| Dev only web app | `pnpm --filter @mallhub/web run dev` |
| Build only web app | `pnpm --filter @mallhub/web run build` |
| Lint only web app | `pnpm --filter @mallhub/web run lint` |
| Type-check only web app | `pnpm --filter @mallhub/web run type-check` |
| Build only UI package | `pnpm --filter @mallhub/ui run build` |
| Lint only UI package | `pnpm --filter @mallhub/ui run lint` |
| Type-check only UI package | `pnpm --filter @mallhub/ui run type-check` |
| Build only notifications package | `pnpm --filter @mallhub/notifications run build` |
| Lint only notifications package | `pnpm --filter @mallhub/notifications run lint` |
| Type-check only notifications package | `pnpm --filter @mallhub/notifications run type-check` |

### Tests

There is currently **no test script or test suite configured** in this repository, so there is no single-test command yet.

Validation workflow (mandatory before finishing changes): run `pnpm run format`, then `pnpm run lint`, then `pnpm run type-check`.

## High-level architecture

- Monorepo with:
  - `apps/web`: React Router v7 SSR app (frontend + server route handlers)
  - `packages/ui`: shared UI component library consumed via `@mallhub/ui`
  - `packages/notifications`: shared Redis + BullMQ notification infrastructure
- API boundaries are route-based in `apps/web/app/routes.ts`:
  - `api/trpc/*` -> `features/trpc/trpc.handler.ts`
  - `api/auth/*` -> `features/better-auth/better-auth.handler.ts`
  - UI pages live under optional locale prefix `:locale?`
- Server domain logic lives under `apps/web/app/features/.server/**`:
  - tRPC context/init/router
  - auth/ability (Better Auth + CASL)
  - Prisma access
  - per-feature `*.query.ts` / `*.mutation.ts`
- AuthN/AuthZ stack:
  - Better Auth (session/auth endpoints, admin + organization plugins)
  - CASL abilities from session user role (`CUSTOMER`, `ADMIN_LOCAL`, `ADMIN_CC`, `ADMIN_PLATFORM`)
  - tRPC procedures enforce auth/role/ability gates in `trpc.init.ts`
- Data layer:
  - Prisma + PostgreSQL
  - Prisma client generated to `apps/web/app/features/.server/prisma/generated`
  - runtime Prisma singleton in `prisma.server.ts`
- i18n stack:
  - Source: `messages/{locale}.json` + `project.inlang/settings.json`
  - Generated output: `apps/web/app/paraglide/*`
  - Locale middleware in `root.tsx`; locale-aware links via `localizeHref`

## Key codebase conventions

1. **Route structure**
   - Keep API routes outside locale prefix and UI routes inside `prefix(':locale?')` in `app/routes.ts`.

2. **tRPC structure and error contract**
   - New server procedures go in `.server/<feature>/*.query.ts` or `*.mutation.ts`, then are wired in `trpc.router.ts`.
   - Use `procedures.public`, `procedures.auth`, or role/ability procedures from `trpc.init.ts`.
   - Preserve the existing TRPC error format that maps `ZodError` to `error.data.zodError` for TanStack Form.

3. **Localization rules**
   - In server code, localize error messages with Paraglide message functions and request locale (`getLocaleFromAsyncStorage()`).
   - For UI routes/links use `localizeHref(...)` instead of hardcoded paths.
   - Edit `messages/*.json` (not generated paraglide files), then compile with `pnpm --filter @mallhub/web run i18n:compile`.

4. **Forms pattern**
   - Interactive forms use TanStack Form with dedicated `*.form.ts` modules.
   - Follow existing pattern: `createFormHookContexts`, `createFormHook`, state schema + submit schema + `z.codec`, exported `toXSubmitData`.

5. **UI/design system usage**
   - Prefer `@mallhub/ui` components over raw HTML controls when equivalent components exist.
   - Use Hugeicons (`@hugeicons/*`) for icons.
   - Use semantic theme tokens from `packages/ui/src/global.css` (avoid raw Tailwind color utilities like `text-blue-500`).

6. **Auth/roles source of truth**
   - Role constants and mappings are centralized in `better-auth-access-control.lib.ts`; reuse `appRoles` instead of string literals.
   - Keep Better Auth + CASL wiring aligned with:
     - `better-auth-server.lib.ts`
     - `app-ability.lib.ts`
     - `trpc.init.ts`

7. **Environment handling**
   - Required env vars are enforced at startup (`server-env.lib.ts`, `client-env.lib.ts`).
   - Do not bypass these checks with fallback literals in feature code (`process.env.X ?? 'fallback'` is not allowed).
   - For server-side env changes: update `apps/web/app/features/.server/env/server-env.lib.ts`, `apps/web/.env.example`, and relevant docker compose environment blocks together.

8. **Generated artifacts**
   - Do not manually edit generated code under:
      - `apps/web/app/paraglide/*`
      - `apps/web/app/features/.server/prisma/generated/*`

9. **Notifications stack (Redis + BullMQ)**
   - Better Auth emails (verification/reset password) are enqueued through `apps/web/app/features/.server/notifications/notification-email-dispatcher.lib.ts`.
   - Queue primitives come from `@mallhub/notifications` (`createRedisConnection`, `createEmailNotificationQueue`, `createEmailNotificationWorker`, `enqueueEmailNotification`).
   - Keep producer logic fire-and-forget; do not block auth flows waiting for SMTP delivery.

10. **Import policy**
   - Use TypeScript path aliases for internal code (`@/`) instead of relative imports.
   - In internal packages, configure alias paths in tsconfig and use them consistently for source imports.

## Form conventions (well-formed pattern)

- Build forms with a dedicated `*.form.ts` module and consume them from page/component files.
- If a feature already has a form instance (or a `*.form.ts` file), prefer TanStack Form state (`values`/`formControls`) over React `useState`/`useEffect` for form-related UI state.
- In every `*.form.ts`, define:
  - `createFormHookContexts()` and `createFormHook(...)`
  - `formOptions(...)` with `defaultValues`
  - a Zod `state` schema and a Zod `data` schema
  - a `z.codec(stateSchema, dataSchema, { decode, encode })` used as `validators.onSubmit`
- UI layers must use form hooks (`useAppForm`/feature-specific `useXForm`) and `withForm`, not ad-hoc `useState` as the source of truth for form data.
- In local form sections, avoid prop drilling by using TanStack form composition (`withForm`) and colocating field logic in composed components.
- For array state, prefer TanStack array patterns (`form.Field` with `mode="array"` and per-item `form.Field` bindings) instead of callback chains that pass update handlers through multiple component levels.
- Field rendering should follow existing shadcn composition (`Field`, `Label`/`FieldLabel`, control, `FieldError`) and bind directly to `form.Field`.
- Every `form.Field` UI must expose its validation state: compute `isInvalid` from field meta, set `data-invalid`/`aria-invalid` according to the control type, and always render the corresponding `FieldError`.
- Validation messages must be localized with Paraglide `m.*` keys (no hardcoded strings), both for client form validation and server-side errors.
- In `.server/**`, localize user-facing errors at source with request locale (`getLocaleFromAsyncStorage` + `m.*`) following `docs/trpc.guide.md`.

### TanStack Form state placement and update rules

Use these rules to keep form state atomic, colocated, and predictable.

#### Good practices

- Prefer `form.Field name="x"` + `field.handleChange(...)` for direct UI input updates.
- Keep updates colocated with the field/UI section that owns the state (cover section updates cover fields, gallery section updates gallery queue, etc.).
- Use small subscriptions (`form.Field` or narrow `form.Subscribe` selectors) close to where values are rendered.
- For object/array fields (for example `formControls.galleryQueue`), compute next value with pure helpers and then call `field.handleChange(nextValue)`.

#### Bad practices (avoid)

- Do not wire direct UI changes as `onChange={(e) => form.setFieldValue('x', e.target.value)}` when the UI is already inside `form.Field`.
- Do not use a single broad selector like `form.Subscribe(selector: state => state.values.formControls)` for large form sections; this reduces atomicity and causes broader re-renders.
- Do not create callback wrappers only to pass `handleChange` around if the logic can live directly inside the relevant `form.Field` render block.

#### When `form.setFieldValue` is correct

Use `form.setFieldValue` for imperative logic that is not a direct field event:

- async flows (`upload started/finished`, preview flags, server-driven resets),
- cross-field orchestration (set multiple fields together after a mutation),
- handlers outside a specific `form.Field` scope where `field.handleChange` is not available.

Rule of thumb:

- **Direct UI input event** -> `field.handleChange`
- **Imperative workflow/state orchestration** -> `form.setFieldValue`

#### Preferred implementation pattern

1. Model UI-only state in `formControls` inside `*.form.ts`.
2. Render each control with its own `form.Field` (or a narrow local subscribe when truly needed).
3. Keep update logic at the closest ownership boundary.
4. Use `form.setFieldValue` only for non-UI imperative transitions.
