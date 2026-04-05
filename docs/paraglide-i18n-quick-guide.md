# Paraglide i18n Quick Guide (Monorepo, AI-friendly)

This repository uses **Paraglide + inlang** with a **shared i18n source** and **per-app compilation**.

## 1. Source of truth

| Item | Path | Notes |
| --- | --- | --- |
| inlang project config | `project.inlang/settings.json` | Defines `baseLocale`, `locales`, plugins, and message file pattern |
| Translations | `messages/{locale}.json` | Shared by all apps |
| Web generated output | `apps/web/app/paraglide/*` | Generated, do not edit manually |

Current locales:
- `es` (base locale)
- `en`

## 2. Current integration in `apps/web`

1. **Compilation**
   - Script: `apps/web/package.json` -> `i18n:compile`
   - Command:
     ```bash
     paraglide-js compile --project ../../project.inlang --outdir ./app/paraglide --strategy url,baseLocale
     ```
2. **Vite plugin**
   - File: `apps/web/vite.config.ts`
   - Uses `paraglideVitePlugin({ project: '../../project.inlang', outdir: './app/paraglide', strategy: ['url', 'baseLocale'] })`
3. **SSR middleware**
   - File: `apps/web/app/root.tsx`
   - `paraglideMiddleware` is applied to non-API routes.
4. **Localized routing**
   - File: `apps/web/app/routes.ts`
   - UI routes are prefixed with optional locale: `:locale?`
   - API routes stay outside locale prefix.

## 3. Daily workflow (web app)

1. Add or update translation keys in:
   - `messages/es.json`
   - `messages/en.json`
2. Compile:
   ```bash
   pnpm --filter @mallhub/web run i18n:compile
   ```
3. Use translations in code:
   ```ts
   import * as m from '@/paraglide/messages.js';
   import { localizeHref } from '@/paraglide/runtime.js';
   ```
4. Use message functions:
   ```ts
   m.home_title();
   m.login_failed_toast({ message: errorMessage });
   ```
5. Use localized links:
   ```ts
   localizeHref('/auth/login');
   ```

## 4. Rules (important)

- Never edit generated files under `app/paraglide`.
- Always add keys in all supported locales.
- Keep API routes excluded from locale middleware unless intentionally localized.
- For route links in UI, prefer `localizeHref()` instead of hardcoded paths.

## 5. Add Paraglide to a future app in `apps/*` (Node.js-based)

Use **Pattern 1 (recommended)**: each app compiles from root `project.inlang`.

### 5.1 Install dependency in the app

```bash
pnpm --filter <app-package-name> add -D @inlang/paraglide-js
```

### 5.2 Add compile script in app `package.json`

From `apps/<new-app>` perspective:

```json
{
  "scripts": {
    "i18n:compile": "paraglide-js compile --project ../../project.inlang --outdir ./src/paraglide --strategy url,baseLocale"
  }
}
```

Adjust `outdir` to the app structure (for React Router web we use `./app/paraglide`).

### 5.3 Compile during app lifecycle

Chain `i18n:compile` before dev/build/type-check scripts.

### 5.4 Add framework integration

- **Vite apps**: add `paraglideVitePlugin(...)` in `vite.config.ts`.
- **SSR apps**: integrate server middleware (`paraglideMiddleware`) and route locale prefix strategy.
- **SPA-only apps**: compile and consume `messages.js` + `runtime.js`; route localization can still use `localizeHref()`.

## 6. Add a new locale

1. Update `project.inlang/settings.json`:
   - Add locale code in `locales`.
2. Create `messages/<new-locale>.json`.
3. Add same keys used in base locale.
4. Recompile each consuming app (or run workspace build).

## 7. AI execution checklist

When an AI agent modifies i18n:

1. Edit only `messages/*.json` and source files (not generated output).
2. Keep keys aligned across locales.
3. Run `pnpm --filter @mallhub/web run i18n:compile`.
4. If routes are touched, preserve:
   - optional locale prefix for UI routes
   - API exclusions in middleware
5. Prefer `m.<key>()` and `localizeHref()` in UI code.
