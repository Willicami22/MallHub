# Roles, Permissions, and Organizations (AI-Optimized Guide)

**Status:** Canonical for the current backend authorization model.  
**Scope:** `apps/web` server-side authz/authn flow (Better Auth + CASL + tRPC).

## 1. Source of truth

Use these files as the authoritative implementation:

1. `apps/web/app/features/better-auth/better-auth-access-control.lib.ts`
2. `apps/web/app/features/.server/auth/better-auth-server.lib.ts`
3. `apps/web/app/features/.server/auth/casl-prisma.lib.ts`
4. `apps/web/app/features/.server/auth/app-ability.lib.ts`
5. `apps/web/app/features/.server/trpc/trpc.init.ts`
6. `apps/web/prisma/schema.prisma` (organization-compatible data model)

If this document and code differ, **code is authoritative**.

## 2. Canonical role model

### 2.1 Roles

- `GUEST` (implicit: unauthenticated user)
- `CUSTOMER`
- `ADMIN_LOCAL`
- `ADMIN_CC`
- `ADMIN_PLATFORM`

### 2.2 Role constants in code

- App role constants: `appRoles`
- Default authenticated role: `defaultAppRole = CUSTOMER`
- Organization creator role: `organizationCreatorRole = ADMIN_PLATFORM`

## 3. Better Auth role and organization mapping

Better Auth plugins enabled:

- `admin(...)`
- `organization(...)`

### 3.1 Mapping matrix

| App role | Better Auth admin access | Better Auth organization access | Can create organization |
|---|---|---|---|
| CUSTOMER | `userAc` | `memberAc` | No |
| ADMIN_LOCAL | `userAc` | `memberAc` | No |
| ADMIN_CC | `userAc` | `adminAc` | No |
| ADMIN_PLATFORM | `adminAc` | `ownerAc` | Yes |

### 3.2 Hard constraints

- Organization creation is allowed only when `user.role === ADMIN_PLATFORM`.
- Better Auth admin plugin treats only `ADMIN_PLATFORM` as an admin role.

## 4. CASL static authorization model

### 4.1 Action vocabulary (fixed)

```ts
type AppAction =
  | 'manage'
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'confirm'
  | 'complete';
```

### 4.2 Subject vocabulary (fixed)

CASL subjects include:

- `User`, `UserProfile`
- `Mall`, `Store`, `StoreRegistrationRequest`
- `Product`, `Promotion`, `Reservation`
- `FavoriteStore`, `FavoriteProduct`, `FavoritePromotion`
- `SearchLog`
- `DailyMallMetric`, `DailyPlatformMetric`
- `AiRun`, `AdminCcAssignment`
- `Organization`, `Member`, `Invitation`
- plus `'all'`

### 4.3 Base permissions

#### Guest (`GUEST`)

- `read` `Mall|Store|Product|Promotion` where `status = ACTIVE`
- `create` `SearchLog` where `isGuest = true`

#### Authenticated baseline (all authenticated roles)

- `read` own `User` (`id = actor.id`)
- `update` own `User` fields: `name`, `phone`, `image`, `preferredMallId`
- `read|create|update` own `UserProfile` (`userId = actor.id`)
- `create` `SearchLog` (`userId = actor.id`, `isGuest = false`)
- `read` own `Member` (`userId = actor.id`)
- `read` own `Invitation` (`email = actor.email`)

### 4.4 Role-specific permissions (static)

#### CUSTOMER

- `create` `Reservation` where `customerUserId = actor.id`
- `read` `Reservation` where `customerUserId = actor.id`
- `update` `Reservation` where `customerUserId = actor.id` and `status = PENDING`
- `read|create|delete` own favorites (`FavoriteStore|FavoriteProduct|FavoritePromotion`)

#### ADMIN_LOCAL

- `create|read` `StoreRegistrationRequest` where `applicantUserId = actor.id`
- `update` `StoreRegistrationRequest` where `applicantUserId = actor.id` and `status = PENDING`
- `create|read|update` `Store` where `ownerUserId = actor.id`
- `create|read|update|delete` `Product|Promotion` via relation `store.ownerUserId = actor.id`
- `read|update|confirm|reject|complete` `Reservation` via relation `store.ownerUserId = actor.id`
- `create|read` `AiRun` where:
  - `jobType = PRODUCT_DRAFT`
  - `requestedByUserId = actor.id`
  - `store.ownerUserId = actor.id`

#### ADMIN_CC

- `read|update` `Mall` where `adminCcUserId = actor.id`
- `read` `Store|Product|Promotion|Reservation|SearchLog` via relation `mall.adminCcUserId = actor.id`
- `read|update|approve|reject` `StoreRegistrationRequest` via relation `mall.adminCcUserId = actor.id`
- `read` `DailyMallMetric` via relation `mall.adminCcUserId = actor.id`
- `create|read` `AiRun` where:
  - `jobType = MALL_REPORT`
  - `requestedByUserId = actor.id`
  - `mall.adminCcUserId = actor.id`
- `read` `AdminCcAssignment` where `adminCcUserId = actor.id`

#### ADMIN_PLATFORM

- `create` `User` where `role = ADMIN_CC`
- `read|update` `User`
- `read|update` `Mall`
- `create` `AdminCcAssignment` where `createdByUserId = actor.id`
- `read` `AdminCcAssignment|DailyPlatformMetric|DailyMallMetric|StoreRegistrationRequest`
- `manage` `Organization|Member|Invitation`

## 5. Runtime enforcement flow

1. `createTRPCContext` reads session via Better Auth.
2. `defineAbilityForSessionUser(user)` produces:
   - `ability` (CASL instance)
   - `role` (`AppRole | null`)
3. Context includes `{ session, user, role, ability }`.
4. tRPC procedures enforce access:
   - `procedures.public` -> no auth
   - `procedures.auth` -> requires session + user + role
   - `procedures.role([...])` -> role gate
   - `procedures.can(action, subjectType)` -> subject-type gate
   - aliases: `customer`, `adminLocal`, `adminCc`, `adminPlatform`

## 6. Recommended usage patterns

### 6.1 Endpoint-level role gate

```ts
export const router = t.router({
  adminOnly: procedures.adminPlatform.query(() => ({ ok: true })),
});
```

### 6.2 Subject-type gate (broad capability check)

```ts
export const router = t.router({
  createMallReport: procedures.can('create', 'AiRun').mutation(/* ... */),
});
```

### 6.3 Record-level gate (required for ownership/relational conditions)

Use CASL `subject` helper exported as `asSubject`.

```ts
import { TRPCError } from '@trpc/server';
import { asSubject } from '@/features/.server/auth/app-ability.lib';

if (ctx.ability.cannot('update', asSubject('Store', storeRecord))) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
}
```

### 6.4 Query-level filtering (recommended with Prisma)

Use `accessibleBy` from `casl-prisma.lib.ts` and combine with business filters.

```ts
import { accessibleBy } from '@/features/.server/auth/casl-prisma.lib';

const stores = await prisma.store.findMany({
  where: {
    AND: [accessibleBy(ctx.ability, 'read').Store, { mallId: input.mallId }],
  },
});
```

## 7. Organization model notes

The schema is organization-compatible with Better Auth organization plugin, including:

- `Organization`
- `Member`
- `Invitation`
- `Session.activeOrganizationId`

This enables org membership, invitations, and active-organization context in sessions.

## 8. AI-oriented policy snapshot (machine-readable)

```yaml
roles:
  GUEST:
    can:
      - { action: read, subject: Mall, where: { status: ACTIVE } }
      - { action: read, subject: Store, where: { status: ACTIVE } }
      - { action: read, subject: Product, where: { status: ACTIVE } }
      - { action: read, subject: Promotion, where: { status: ACTIVE } }
      - { action: create, subject: SearchLog, where: { isGuest: true } }

  CUSTOMER:
    inherits: [AUTHENTICATED_BASE]
    can:
      - { action: create, subject: Reservation, where: { customerUserId: "$actor.id" } }
      - { action: read, subject: Reservation, where: { customerUserId: "$actor.id" } }
      - { action: update, subject: Reservation, where: { customerUserId: "$actor.id", status: PENDING } }
      - { action: [read, create, delete], subject: FavoriteStore, where: { userId: "$actor.id" } }
      - { action: [read, create, delete], subject: FavoriteProduct, where: { userId: "$actor.id" } }
      - { action: [read, create, delete], subject: FavoritePromotion, where: { userId: "$actor.id" } }

  ADMIN_LOCAL:
    inherits: [AUTHENTICATED_BASE]
    can:
      - { action: [create, read], subject: StoreRegistrationRequest, where: { applicantUserId: "$actor.id" } }
      - { action: update, subject: StoreRegistrationRequest, where: { applicantUserId: "$actor.id", status: PENDING } }
      - { action: [create, read, update], subject: Store, where: { ownerUserId: "$actor.id" } }
      - { action: [create, read, update, delete], subject: Product, where: { store: { is: { ownerUserId: "$actor.id" } } } }
      - { action: [create, read, update, delete], subject: Promotion, where: { store: { is: { ownerUserId: "$actor.id" } } } }
      - { action: [read, update, confirm, reject, complete], subject: Reservation, where: { store: { is: { ownerUserId: "$actor.id" } } } }
      - { action: [create, read], subject: AiRun, where: { jobType: PRODUCT_DRAFT, requestedByUserId: "$actor.id", store: { is: { ownerUserId: "$actor.id" } } } }

  ADMIN_CC:
    inherits: [AUTHENTICATED_BASE]
    can:
      - { action: [read, update], subject: Mall, where: { adminCcUserId: "$actor.id" } }
      - { action: read, subject: Store, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: read, subject: Product, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: read, subject: Promotion, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: read, subject: Reservation, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: read, subject: SearchLog, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: [read, update, approve, reject], subject: StoreRegistrationRequest, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: read, subject: DailyMallMetric, where: { mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: [create, read], subject: AiRun, where: { jobType: MALL_REPORT, requestedByUserId: "$actor.id", mall: { is: { adminCcUserId: "$actor.id" } } } }
      - { action: read, subject: AdminCcAssignment, where: { adminCcUserId: "$actor.id" } }

  ADMIN_PLATFORM:
    inherits: [AUTHENTICATED_BASE]
    can:
      - { action: create, subject: User, where: { role: ADMIN_CC } }
      - { action: [read, update], subject: User }
      - { action: [read, update], subject: Mall }
      - { action: create, subject: AdminCcAssignment, where: { createdByUserId: "$actor.id" } }
      - { action: read, subject: AdminCcAssignment }
      - { action: read, subject: DailyPlatformMetric }
      - { action: read, subject: DailyMallMetric }
      - { action: read, subject: StoreRegistrationRequest }
      - { action: manage, subject: Organization }
      - { action: manage, subject: Member }
      - { action: manage, subject: Invitation }

better_auth:
  default_role: CUSTOMER
  admin_roles: [ADMIN_PLATFORM]
  organization_creator_role: ADMIN_PLATFORM
  allow_user_to_create_organization: "user.role == ADMIN_PLATFORM"
  admin_plugin_role_map:
    CUSTOMER: userAc
    ADMIN_LOCAL: userAc
    ADMIN_CC: userAc
    ADMIN_PLATFORM: adminAc
  organization_plugin_role_map:
    CUSTOMER: memberAc
    ADMIN_LOCAL: memberAc
    ADMIN_CC: adminAc
    ADMIN_PLATFORM: ownerAc
```

