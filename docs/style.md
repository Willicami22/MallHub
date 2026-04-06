# MallHub Design Style Guide

> AI-optimized reference for replicating the MallHub design system across all pages and features.

## 1. Design Philosophy

**Core identity**: Modern, trustworthy, commercial — not techy or exaggerated.

MallHub is a digital mall platform for everyday consumers and store managers. The design should feel like walking into a well-curated, clean, welcoming shopping center — not a developer tool or a SaaS dashboard.

**Guiding principles**:

- **Clean & spacious**: Generous whitespace, uncluttered layouts, breathing room between elements.
- **Warm confidence**: Inspire trust through professional polish without cold corporate sterility.
- **Accessible simplicity**: Every interaction should feel intuitive. No cognitive overload.
- **Consistent restraint**: Use the design system tokens. No ad-hoc colors, no arbitrary values for typography or spacing.

## 2. Color System

**RULE: Only use semantic theme variables from `packages/ui/src/global.css`. Never use raw Tailwind color classes (e.g., `text-blue-500`, `bg-gray-100`).**

### Primary palette

| Token                  | Usage                                            |
| ---------------------- | ------------------------------------------------ |
| `bg-primary`           | Primary action backgrounds, brand panels         |
| `text-primary`         | Primary links, accent text                       |
| `text-primary-foreground` | Text on primary backgrounds                   |
| `bg-secondary`         | Secondary buttons, subtle containers             |
| `text-secondary-foreground` | Text on secondary backgrounds               |

### Surface colors

| Token                  | Usage                                            |
| ---------------------- | ------------------------------------------------ |
| `bg-background`        | Page backgrounds, form panels                    |
| `text-foreground`      | Primary body text, headings                      |
| `bg-card`              | Card surfaces                                    |
| `text-card-foreground` | Text on card surfaces                            |
| `bg-muted`             | Subtle background fills, disabled states         |
| `text-muted-foreground`| Secondary text, descriptions, placeholders       |

### Semantic colors

| Token                  | Usage                                            |
| ---------------------- | ------------------------------------------------ |
| `bg-accent`            | Hover states, highlighted areas                  |
| `text-accent-foreground` | Text on accent backgrounds                     |
| `bg-destructive`       | Error states, destructive action backgrounds     |
| `text-destructive`     | Error text, validation messages                  |
| `border-border`        | Default borders                                  |
| `border-input`         | Input field borders                              |
| `ring-ring`            | Focus ring color                                 |

### Opacity variations

When needing lighter/transparent versions, use Tailwind opacity modifiers on semantic tokens:
- `bg-primary/10` — very subtle primary tint
- `text-foreground/60` — reduced emphasis text
- `border-border/50` — subtle borders

## 3. Typography

**Font stack** (defined in theme):
- **Sans**: `Plus Jakarta Sans` — primary UI font, warm and geometric
- **Serif**: `Lora` — reserved for editorial or premium content
- **Mono**: `IBM Plex Mono` — code or technical displays

**Heading hierarchy** (auth pages reference):
- Page title: `text-2xl font-semibold tracking-tight text-foreground`
- Brand name (hero): `text-4xl font-bold tracking-tight` (desktop) / `text-2xl` (mobile)
- Subtitle: `text-sm text-muted-foreground`
- Section: `text-lg font-medium text-foreground`

**Body text**:
- Default: `text-sm text-foreground`
- Secondary: `text-sm text-muted-foreground`
- Caption: `text-xs text-muted-foreground`

**RULE: Use theme tracking values (`tracking-tight`, `tracking-normal`) over arbitrary values.**

## 4. Spacing & Layout

**Base spacing unit**: `--spacing: 0.27rem` (defined in theme). All Tailwind spacing utilities use this multiplier.

### Auth page layout pattern (reusable for onboarding, settings, etc.)

```
Desktop (lg+):
┌──────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Brand Panel     │  │  Content Panel           │  │
│  │  (45% width)     │  │  (55% width)             │  │
│  │  bg-primary      │  │  bg-background           │  │
│  │  + decorative    │  │  max-w-md centered       │  │
│  │  SVG patterns    │  │                          │  │
│  └──────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘

Mobile:
┌────────────────────┐
│  Brand header      │  (text only, no panel bg)
│  Content           │  (full width, px-6 py-12)
└────────────────────┘
```

### Common spacing patterns

| Context             | Spacing                             |
| ------------------- | ----------------------------------- |
| Section gap         | `space-y-6`                         |
| Form field gap      | `space-y-5` (within form)           |
| FieldGroup gap      | `gap-5` (built into FieldGroup)     |
| Heading + subtitle  | `space-y-2`                         |
| Button group        | `gap-3` (flex)                      |
| Page padding        | `px-6 py-12`                        |
| Content max-width   | `max-w-md` (forms), `max-w-3xl` (content pages) |

## 5. Component Usage Rules

### MANDATORY: Use shadcn components over HTML natives

| ❌ Never use       | ✅ Always use                              |
| ------------------- | ----------------------------------------- |
| `<button>`          | `<Button>` from `@mallhub/ui`             |
| `<input>`           | `<Input>` or `<InputGroupInput>`          |
| `<label>`           | `<FieldLabel>` (in fields) or `<Label>` (compound components) |
| `<hr>`              | `<Separator>`                             |
| `<a>`               | `<Button variant="link">` or `<Link>` from `@mallhub/ui` |

### Form field structure

Always wrap form fields with the Field component system:

```tsx
<Field>
  <FieldLabel htmlFor="field-id">Label text</FieldLabel>
  <InputGroup>
    <InputGroupAddon align="inline-start">
      <HugeiconsIcon icon={SomeIcon} />
    </InputGroupAddon>
    <InputGroupInput id="field-id" placeholder="..." />
    {/* Optional: inline-end addon for actions like password toggle */}
  </InputGroup>
  <FieldError>{errorMessage}</FieldError>
</Field>
```

Group multiple fields with `<FieldGroup>` for consistent spacing.

### Button patterns

- **Primary CTA**: `<Button size="lg" className="w-full">` — full-width, large
- **Secondary action**: `<Button variant="outline" size="lg">`
- **Inline text link**: `<Button variant="link" size="sm" className="h-auto p-0">`
- **Navigation link-button**: `<Button render={<Link to={localizeHref('...')} />}>`
- **Loading state**: Spinner + text inside button, with `disabled={isSubmitting}`

```tsx
<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner />
      {m.loading_text()}
    </>
  ) : (
    m.submit_text()
  )}
</Button>
```

### Input with icon + password toggle

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start">
    <HugeiconsIcon icon={LockPasswordIcon} />
  </InputGroupAddon>
  <InputGroupInput
    type={showPassword ? 'text' : 'password'}
    autoComplete="current-password"
  />
  <InputGroupAddon align="inline-end">
    <InputGroupButton
      onClick={() => setShowPassword(!show)}
      aria-label={m.auth_toggle_password()}
    >
      <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

## 6. Icons

**RULE: Never use inline SVG for icons. Always use HugeIcons.**

```tsx
import { SomeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

<HugeiconsIcon icon={SomeIcon} />
```

- Default icon sizing is handled by parent components (e.g., InputGroupAddon auto-sizes to `size-4`).
- For custom sizing: use `className="size-5"` (Tailwind size utilities).
- **Decorative SVG** (patterns, dots, circles, waves) is allowed as inline SVG with `aria-hidden="true"`.

### Commonly used icons

| Context         | Icon                    |
| --------------- | ----------------------- |
| Email field     | `Mail01Icon`            |
| Password field  | `LockPasswordIcon`      |
| Show password   | `ViewIcon`              |
| Hide password   | `ViewOffSlashIcon`      |
| User/name field | `UserIcon`              |
| Phone field     | `SmartPhone01Icon`      |
| Loading/spinner | `Loading03Icon` (via `<Spinner>`) |
| External link   | `ExternalLink`          |
| Checkmark       | `Tick02Icon`            |

## 7. Decorative Elements

The brand panel uses decorative SVG for visual richness without relying on images:

- **Dot grid pattern**: Repeating `circle` elements with `opacity: 0.12`, subtle texture
- **Floating circles**: Large circles (`r="80-160"`) with very low opacity (`0.04-0.08`), filled
- **Ring outlines**: Unfilled circles with thin strokes (`strokeWidth="1-1.5"`) at `opacity: 0.10-0.12`

All decorative SVG uses `currentColor` with `text-primary-foreground` to inherit theme colors.

```tsx
<svg className="absolute inset-0 h-full w-full text-primary-foreground" aria-hidden="true">
  {/* Dot grid */}
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.12" />
  </pattern>
  <rect width="100%" height="100%" fill="url(#dots)" />
  {/* Floating shapes */}
  <circle cx="15%" cy="20%" r="120" fill="currentColor" opacity="0.06" />
</svg>
```

## 8. Internationalization (i18n)

**RULE: All user-visible text must use Paraglide message functions.**

```tsx
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

// Text
m.login_title()

// Links
localizeHref('/auth/login')

// Parameterized messages
m.login_failed_toast({ message: errorMessage })
```

### Key naming conventions

| Pattern                       | Example                         |
| ----------------------------- | ------------------------------- |
| `{page}_{element}`            | `login_title`, `register_submit` |
| `{page}_meta_{field}`         | `login_meta_title`              |
| `{page}_{element}_placeholder`| `login_email_placeholder`       |
| `{page}_{action}_toast`       | `register_success_toast`        |
| `auth_{shared_element}`       | `auth_brand_tagline`            |

- Always add keys in all supported locales (`es`, `en`).
- Base locale is `es`.

## 9. Responsive Design

### Breakpoint strategy

- **Mobile-first**: Default styles target mobile.
- **lg (1024px+)**: Split-panel layouts, desktop-specific compositions.
- **md (768px+)**: Minor adjustments (e.g., button row vs column).

### Patterns

- **Hide on mobile**: `hidden lg:flex` (e.g., brand panel)
- **Show on mobile only**: `lg:hidden` (e.g., mobile brand header)
- **Stack to row**: `flex flex-col sm:flex-row` (e.g., button groups)
- **Content width**: `w-full max-w-md` (constrain form width)

## 10. Dark Mode

The theme fully supports dark mode via the `.dark` class (managed by `next-themes`).

**All semantic tokens automatically adapt.** No manual dark mode overrides needed when using the theme variables correctly.

For elements with custom opacity or decorative styling, verify readability in both modes.

## 11. Motion & Transitions

- **Rely on built-in component transitions**: Button hover, input focus rings, and checkbox indicators all have transitions defined in the component library.
- **Avoid custom CSS animations** unless specifically needed for a feature (e.g., loading skeleton shimmer).
- **Loading states**: Use the `<Spinner>` component (animated via `animate-spin`).

## 12. Accessibility

- **ARIA labels**: Always provide `aria-label` for icon-only buttons (e.g., password toggle).
- **Semantic markup**: Use `Field`, `FieldLabel`, `FieldError` for form accessibility.
- **Focus management**: Components handle focus rings via `focus-visible:` states.
- **Decorative SVG**: Always include `aria-hidden="true"`.
- **Labels**: Every input must have an associated `FieldLabel` or `Label` with `htmlFor`.

## 13. Page Architecture Checklist

When creating a new page, follow this checklist:

1. **Route**: Register in `apps/web/app/routes.ts` inside the `:locale?` prefix.
2. **Meta**: Export `meta` function with `{page}_meta_title` and `{page}_meta_description`.
3. **i18n**: Add all keys in both `messages/es.json` and `messages/en.json`.
4. **Compile**: Run `pnpm --filter @mallhub/web run i18n:compile` after adding keys.
5. **Components**: Import from `@mallhub/ui`, not from relative paths to individual component files.
6. **Icons**: Import from `@hugeicons/core-free-icons` + `@hugeicons/react`.
7. **Links**: Use `localizeHref()` for all internal navigation.
8. **Layout**: Reuse existing layout components (e.g., `AuthLayout` for auth flows).

## 14. File Organization

```
apps/web/app/features/
├── better-auth/
│   ├── components/
│   │   └── auth-layout.tsx          # Shared auth page layout
│   ├── login/
│   │   └── login.route.tsx          # Login page
│   ├── register/
│   │   └── register.route.tsx       # Register page
│   ├── better-auth-client.lib.ts    # Auth client (signIn, signOut, signUp)
│   └── better-auth.handler.ts       # Server-side auth handler
├── home/
│   └── route/
│       └── home.route.tsx           # Home page
└── .server/
    └── auth/                        # Server-only auth logic
```

## 16. Brand Panel Design (Auth Layout)

The auth split-panel is one of the most visible surfaces in the app. Its brand panel **must not be minimal** — it communicates MallHub's value proposition at first glance.

### Visual composition layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Rotated cross-hatch grid      │  Fine lines at 12°, opacity 0.09
│  Layer 2: Concentric arcs (top-right)   │  5 rings r=460→100, opacity 0.05→0.14
│  Layer 3: Diffuse glow (bottom-left)    │  Filled circle, opacity 0.05
│  Layer 4: Horizontal accent line        │  At y=87%, w=62%, opacity 0.12
│  Layer 5: Content (z-10)               │  Brand mark, headline, features, footer
└─────────────────────────────────────────┘
```

### Grid texture — architectural precision feel

```svg
<pattern id="auth-crosshatch" width="52" height="52"
         patternUnits="userSpaceOnUse"
         patternTransform="rotate(12 0 0)">
  <line x1="0" y1="0" x2="52" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.09" />
  <line x1="0" y1="0" x2="0" y2="52" stroke="currentColor" strokeWidth="0.5" opacity="0.09" />
</pattern>
```

### Concentric arcs — compass / sonar feel

Centered at the top-right corner (`cx="100%" cy="0"`), five rings at graduated opacity create depth without animation:

```svg
<!-- 5 rings: radii 460, 360, 265, 178, 100 → opacity 0.05 to 0.14 -->
<circle cx="100%" cy="0" r="460" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.05" />
...
<circle cx="100%" cy="0" r="100" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.14" />
```

### Geometric brand mark

A 2×2 grid of rounded squares with cascading opacity — evokes a mall floor-plan directory:

```svg
<rect opacity="0.95" />  <!-- top-left: primary -->
<rect opacity="0.55" />  <!-- top-right: secondary -->
<rect opacity="0.55" />  <!-- bottom-left: secondary -->
<rect opacity="0.18" />  <!-- bottom-right: ghost -->
```

### Content structure (top → middle → bottom pattern)

```
TOP: brand mark + "MALLHUB" (tracking-widest, text-xs, uppercase, opacity-75)

MIDDLE:
  eyebrow: text-xs, tracking-widest, uppercase, opacity-35
  h2: text-5xl, font-bold, leading-[1.08], tracking-tight
      line 3 at opacity-35 (creates visual fade/depth)
  decorative rule: h-px w-10 + h-px w-3 (two segments, different lengths)
  feature callouts: 3 items
    ├── icon container: size-9, rounded-xl, border border-current/15, bg-current/10
    ├── title: text-sm, font-semibold, opacity-90
    └── desc: text-xs, leading-relaxed, opacity-40

BOTTOM: separator (h-px, opacity-10) + copyright (text-xs, opacity-25)
```

### Opacity usage on primary-foreground (white)

The panel creates depth using white at many opacity levels:
- **0.95** → Brand mark primary square (near solid)
- **0.90** → Feature titles
- **0.80** → Wordmark text (close to full white)
- **0.75** → Wordmark label
- **0.55** → Brand mark secondary squares
- **0.40** → Feature descriptions  
- **0.35** → Headline line 3, eyebrow text
- **0.30** → Decorative rule primary line
- **0.25** → Copyright text, footer separator
- **0.18** → Brand mark ghost square
- **0.15** → Decorative rule secondary line, icon border
- **0.14–0.05** → SVG arc rings (decreasing with radius)
- **0.10** → Footer separator line

### Icon container pattern (feature callouts)

```tsx
<div className="mt-px flex size-9 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-current/10">
  <HugeiconsIcon icon={FeatureIcon} className="size-4" strokeWidth={1.5} />
</div>
```

- `border-current/15` — inherits `text-primary-foreground`, so semi-transparent white border
- `bg-current/10` — 10% white fill (subtle glass effect)
- `strokeWidth={1.5}` — slightly thinner than default for refined look inside small container


| ✅ Do                                          | ❌ Don't                                        |
| ----------------------------------------------- | ------------------------------------------------ |
| Use `bg-primary`, `text-foreground`, etc.        | Use `bg-purple-600`, `text-gray-500`             |
| Use `<Button>`, `<Input>`, `<FieldLabel>`        | Use `<button>`, `<input>`, `<label>`             |
| Use `<HugeiconsIcon icon={...} />`               | Use inline `<svg>` for icons                     |
| Use `m.key_name()` for all text                  | Hardcode strings in JSX                          |
| Use `localizeHref('/path')`                      | Hardcode `href="/path"`                          |
| Use `space-y-6`, `gap-3`, `max-w-md`            | Use `margin-top: 24px`, custom pixel values      |
| Use `<Separator />` for visual dividers          | Use `<hr>` or border hacks                       |
| Use `<Spinner />` for loading                    | Use custom CSS spinners                          |
| Provide `aria-label` for icon buttons            | Leave icon buttons unlabeled                     |
| Test in both light and dark modes                | Only test in one theme                           |
