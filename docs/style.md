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

### Brand panel accent system (`bg-primary` context)

Inside `bg-primary` panels, every element inherits `text-primary-foreground`. Use this **two-axis hierarchy** — opacity reduces emphasis, a frosted box *increases* it:

| Role          | Pattern                                                   |
| ------------- | --------------------------------------------------------- |
| **Accent**    | `bg-primary-foreground/15 rounded-xl px-3 inline-block`   |
| Hero          | `text-primary-foreground` (no modifier) — 100%            |
| Label         | `opacity-75` — wordmark, prominent labels                 |
| Secondary     | `opacity-50` — eyebrow, supporting copy                   |
| Muted         | `opacity-40` — feature descriptions                       |
| Ghost         | `opacity-25` — numbers, copyright                         |
| Decorative    | `opacity-10` – `opacity-15` — lines, borders              |

**Accent = frosted highlight**: `bg-primary-foreground/15` creates a semi-transparent white box that makes an element visually *elevated* compared to plain text. Use it when an inline phrase or line must feel featured — not faded.

```tsx
{/* Accented headline line — elevated, not de-emphasized */}
<span className="inline-block rounded-xl bg-primary-foreground/15 px-3 opacity-90">
  {m.auth_brand_headline_3()}
</span>
```

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

### Component granularity and state colocation (MANDATORY)

- Avoid giant components for form-heavy UI. Split into smaller local components and keep each one focused on a single concern (field block, footer actions, filters, etc.).
- Prefer splitting inside the same file first when components are small and only locally reused. Extract to new files only when reuse or file size justifies it.
- Keep state physically close to the UI that reads/writes it. Do not centralize unrelated form UI state in a parent component.
- For forms, use TanStack Form (`*.form.ts`) as the source of truth. Use `formControls` for UI-only state (dialog visibility, toggles, section state) when relevant.
- In direct field input handlers, use `field.handleChange(...)`; reserve `form.setFieldValue(...)` for imperative orchestration (async flows, cross-field updates, resets).
- Avoid broad subscriptions that read the entire form state; subscribe narrowly with `form.Field` or focused `form.Subscribe` selectors.

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

The brand panel uses layered SVG for visual richness without relying on images.

### Pattern language — "Vertex" aesthetic

- **45° diagonal lines**: Single-direction stripes (`rotate(45)`), 64px spacing, `strokeWidth="0.6"`, `opacity="0.07"` — creates forward motion and energy
- **Dot grid cluster**: Dense dot pattern (`r="0.8"`, `opacity="0.18"`) masked to the upper-right quadrant only — textural contrast without uniformity
- **Atmospheric glow blob**: Large filled circle at a panel corner, `opacity="0.06"` — soft depth anchor
- **Centered orbital rings**: 3 concentric circles (`r=140/220/310`) at panel center, unfilled strokes with graduated opacity (`0.09→0.05`) — radar/signal feel
- **Radial corner lines**: 3 straight lines emanating from the bottom-right corner, graduated opacity — directional energy
- **Horizontal accent rule**: Full-width line at 18% panel height, `opacity="0.12"` — architectural precision

All decorative SVG uses `currentColor` with `text-primary-foreground` on the `<svg>` element.

```tsx
<svg className="absolute inset-0 h-full w-full text-primary-foreground" aria-hidden="true">
  <defs>
    {/* 45° diagonal field */}
    <pattern id="auth-diagonal" width="64" height="64"
             patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
      <line x1="0" y1="0" x2="64" y2="0" stroke="currentColor" strokeWidth="0.6" opacity="0.07" />
    </pattern>
    {/* Dense dot cluster */}
    <pattern id="auth-dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.8" fill="currentColor" opacity="0.18" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#auth-diagonal)" />
  {/* Dot cluster — upper-right quadrant only */}
  <rect x="55%" y="0" width="45%" height="40%" fill="url(#auth-dots)" />
</svg>
```

### Ghosted letterform depth layer

An absolutely positioned div with `opacity-5` places the words "MALL" and "HUB" stacked at `text-9xl font-black` — they function as texture, not readable content:

```tsx
<div className="pointer-events-none absolute inset-0 flex select-none flex-col
                items-center justify-center overflow-hidden text-primary-foreground opacity-5"
     aria-hidden="true">
  <span className="text-9xl font-black uppercase leading-none tracking-tighter">MALL</span>
  <span className="text-9xl font-black uppercase leading-none tracking-tighter">HUB</span>
</div>
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
9. **Form composition**: Keep components small and colocate state near the changing UI. Prefer TanStack Form + `formControls` over ad-hoc `useState` for form UI state.

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

The auth split-panel is one of the most visible surfaces in the app. The brand panel communicates MallHub's energy and identity at first glance — bold, spatial, editorial.

**Design language: "Vertex"** — diagonal energy, orbital depth, catalogue typography.

### Visual composition layers

```
┌─────────────────────────────────────────┐
│  Layer 1: 45° diagonal lines            │  64px spacing, opacity 0.07
│  Layer 2: Dot grid (upper-right only)   │  20px grid, dots r=0.8, opacity 0.18
│  Layer 3: Top-left atmospheric glow     │  Filled circle r=280, opacity 0.06
│  Layer 4: 3 centered orbital rings      │  r=140/220/310, opacity 0.09→0.05
│  Layer 5: 3 radial lines (bottom-right) │  Graduated opacity 0.07→0.05
│  Layer 6: Horizontal accent rule        │  At y=18%, opacity 0.12
│  Layer 7: Ghosted letterforms (MALL/HUB)│  text-9xl, absolute, opacity-5
│  Layer 8: Content (z-10)               │  Brand mark, headline, grid, footer
└─────────────────────────────────────────┘
```

### Diagonal field — motion & forward energy

```svg
<pattern id="auth-diagonal" width="64" height="64"
         patternUnits="userSpaceOnUse"
         patternTransform="rotate(45 0 0)">
  <line x1="0" y1="0" x2="64" y2="0" stroke="currentColor" strokeWidth="0.6" opacity="0.07" />
</pattern>
```

Single-direction diagonal lines (not crosshatch) read as motion and momentum — appropriate for a commerce platform.

### Orbital rings — radar / signal feel

Centered in the panel body (`cx="50%" cy="52%"`), three rings at graduated opacity create depth without directional bias:

```svg
<!-- radii: 310, 220, 140 → opacity: 0.05, 0.07, 0.09 -->
<circle cx="50%" cy="52%" r="310" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.05" />
...
<circle cx="50%" cy="52%" r="140" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.09" />
```

### Ghosted letterform depth layer

```tsx
<div className="pointer-events-none absolute inset-0 flex select-none flex-col
                items-center justify-center overflow-hidden text-primary-foreground opacity-5"
     aria-hidden="true">
  <span className="text-9xl font-black uppercase leading-none tracking-tighter">MALL</span>
  <span className="text-9xl font-black uppercase leading-none tracking-tighter">HUB</span>
</div>
```

The brand words at 5% opacity act as pure atmosphere — visible as texture on close inspection, invisible as text.

### Content structure (top → middle → bottom)

```
TOP: brand mark + "MALLHUB" (tracking-widest, text-xs, uppercase, opacity-75)

MIDDLE (space-y-10):
  ┌─ Headline block (space-y-4) ────────────────────────┐
  │  eyebrow row: [h-px w-6 line] + [text-xs uppercase]  │
  │  h2: text-6xl, font-bold, leading-[1.05], tracking-tight │
  │      line 3 at opacity-30                            │
  │  separator: [flex-1 h-px] + [size-1 dot] + [w-8 h-px]│
  └──────────────────────────────────────────────────────┘
  ┌─ Features (grid-cols-3, gap-4) ─────────────────────┐
  │  Each column (space-y-3):                            │
  │    ├── "01" label: text-2xs, uppercase, opacity-30   │
  │    ├── icon container: size-9, rounded-xl, border/15 │
  │    ├── title: text-xs, font-semibold, uppercase, /90 │
  │    └── desc: text-xs, leading-relaxed, opacity-40    │
  └──────────────────────────────────────────────────────┘

BOTTOM: separator (h-px, opacity-10) + copyright (text-xs, opacity-25)
```

### Eyebrow treatment — line-prefixed

```tsx
<div className="flex items-center gap-3">
  <div className="h-px w-6 bg-current opacity-35" />
  <p className="text-xs font-medium tracking-widest uppercase opacity-35">
    {m.auth_brand_eyebrow()}
  </p>
</div>
```

### Full-width separator with dot accent

Replaces the previous two short lines. Creates a wider, more architectural visual beat:

```tsx
<div className="flex items-center gap-2.5 pt-1">
  <div className="h-px flex-1 bg-current opacity-15" />
  <div className="size-1 rounded-full bg-current opacity-30" />
  <div className="h-px w-8 bg-current opacity-15" />
</div>
```

### Feature callout pattern — catalogue grid

Features arranged as a 3-column horizontal grid with editorial numbered labels (`01/02/03`) instead of a vertical list. This creates a visual rhythm closer to a product catalogue or wayfinding system:

```tsx
<div className="grid grid-cols-3 gap-4">
  {features.map((feature, index) => (
    <div key={feature.getTitle()} className="space-y-3">
      <p className="text-2xs font-bold tracking-widest uppercase opacity-30">
        {FEATURE_NUMBERS[index]}
      </p>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl
                      border border-current/15 bg-current/10">
        <HugeiconsIcon icon={feature.icon} className="size-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide leading-snug opacity-90">
          {feature.getTitle()}
        </p>
        <p className="mt-1 text-xs leading-relaxed opacity-40">
          {feature.getDesc()}
        </p>
      </div>
    </div>
  ))}
</div>
```

### Opacity usage on primary-foreground (white)

See **Section 2 → Brand panel accent system** for the full hierarchy. Quick reference:

- **`bg-primary-foreground/15` box** → Accent highlight (headline line 3, featured phrases)
- **0.95** → Brand mark primary square
- **0.90** → Accent text inside frosted box, feature titles
- **0.75** → Wordmark label
- **0.50** → Eyebrow text
- **0.40** → Feature descriptions
- **0.25** → Copyright, ghost labels
- **0.18** → Brand mark ghost square, dot grid pattern
- **0.15** → Separator lines, icon border
- **0.12** → Horizontal accent rule
- **0.10** → Footer separator
- **0.09–0.05** → SVG orbital rings (inner→outer)
- **0.07** → Diagonal field lines
- **0.05** → Ghosted letterforms (`opacity-5` Tailwind class)


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
