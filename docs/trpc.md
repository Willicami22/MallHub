# tRPC Server Guide (AI-Optimized)

This guide documents the tRPC patterns used in this project so they can be reproduced in other TypeScript SSR apps.

It is intentionally written for both humans and AI agents: explicit conventions, code templates, and concrete file references.

## 1) Route and boundary layout

Expose tRPC only through a dedicated route handler.

Reference:
- `apps/web/app/routes.ts` (`api/trpc/*`)
- `apps/web/app/features/trpc/trpc.handler.ts`

Pattern:
```ts
// routes.ts
route('api/trpc/*', 'features/trpc/trpc.handler.ts');
```

```ts
// trpc.handler.ts
return localeContextStorage.run(locale, () =>
  fetchRequestHandler({
    createContext: createTRPCContext,
    endpoint: '/api/trpc',
    req: args.request,
    router: appRouter,
  }),
);
```

Why:
- Keeps API boundary centralized.
- Ensures every request has locale context before procedures run.

## 2) Locale-aware server errors (mandatory)

Always localize server-side validation/business errors.

References:
- `apps/web/app/features/.server/trpc/locale.context.ts`
- `apps/web/app/features/.server/trpc/trpc.init.ts`
- `apps/web/app/features/.server/customers/create-customer.mutation.ts`

Pattern:
```ts
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { m } from '@/features/i18n/paraglide/messages';

z.string({
  error: () => m.missingField({}, { locale: getLocaleFromAsyncStorage() }),
}).min(1, {
  error: () => m.missingField({}, { locale: getLocaleFromAsyncStorage() }),
});
```

```ts
throw new TRPCError({
  code: 'FORBIDDEN',
  message: m.unauthorizedAccess({}, { locale: getLocaleFromAsyncStorage() }),
});
```

Rules:
- Do not hardcode English strings in `.server/**` errors.
- Use `m.someKey({}, { locale: getLocaleFromAsyncStorage() })`.
- Keep UI copy localized client-side too, but server errors must be localized at source.

## 3) Context and procedures

Resolve auth/session/authorization once per request in context.

Reference:
- `apps/web/app/features/.server/trpc/trpc.init.ts`

Pattern:
```ts
export const createTRPCContext = async (ctx) => {
  const session = await auth.api.getSession({ headers: ctx.req.headers });
  const ability = defineAbilitiesForUser(session?.user);
  const roleCapabilities = getRoleCapabilitiesByRole(session?.user.role);

  return {
    headers: ctx.req.headers,
    session: session?.session,
    user: session?.user,
    ability,
    roleCapabilities,
  };
};
```

Procedure split:
- `procedures.public`: no auth required.
- `procedures.auth`: authenticated flows only.

Auth middleware should throw localized `UNAUTHORIZED` errors.

## 4) Query vs mutation contract

References:
- Router composition: `apps/web/app/features/.server/trpc/app-router.ts`
- Example mutation: `apps/web/app/features/.server/customers/create-customer.mutation.ts`
- Example query: `apps/web/app/features/.server/customers/get-customer-by-id.query.ts`

Rules:
- `*.query.ts` = read-only data retrieval.
- `*.mutation.ts` = create/update/delete or side effects.
- Validate all procedure inputs with Zod.
- Keep procedure files feature-scoped under `.server/<feature>/`.

## 5) Authorization in procedures (CASL)

References:
- `apps/web/app/features/.server/auth/authorization.lib.ts`
- `apps/web/app/features/.server/orders/update-order-status.mutation.ts`

Pattern:
```ts
assertCanAny(ctx.ability, [
  { action: 'update-status-all', subjectType: 'Order' },
  {
    action: 'update-status-assigned',
    subjectType: 'Order',
    subjectValue: { assignedToUserId: ctx.user.id },
  },
]);
```

Rules:
- Use `ctx.ability` as the authorization source of truth.
- Prefer `assertCan` / `assertCanAny`.
- Enforce scope in DB operations (not only in UI visibility).

## 6) Error shaping for forms and field-level feedback

Reference:
- `apps/web/app/features/.server/trpc/trpc.init.ts` (`errorFormatter`)

This project maps `TRPCError` + `ZodError` into `error.data.zodError` shape compatible with TanStack Form.

Pattern:
```ts
errorFormatter: ({ shape, error }) => {
  const zodError = buildZodErrorFromTRPCError(error);
  return {
    ...shape,
    data: {
      ...shape.data,
      message: zodError ? zodError.message : null,
      zodError: zodError ? formatZodToTanStack(zodError) : null,
    },
  };
}
```

For field-specific not-found/domain errors, attach a `ZodError` in `cause`:
```ts
throw new TRPCError({
  code: 'NOT_FOUND',
  message: m.orderNotFound({}, { locale }),
  cause: new z.ZodError([
    { code: 'custom', message: m.orderNotFound({}, { locale }), path: ['orderId'] },
  ]),
});
```

## 7) Client usage with TanStack Query

References:
- `apps/web/app/features/customers/components/dialogs/create-customer-dialog.tsx`
- `apps/web/app/features/orders/orders.route.tsx`

Pattern:
```ts
const trpc = useTRPC();

const createMutation = useMutation(
  trpc.customers.createCustomer.mutationOptions({
    onError: (error, _vars, context) => {
      // rollback optimistic cache when needed
      toast.error(error.data?.zodError?.name?.message ?? m.createCustomerFailed());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.customers.getCustomers.queryKey(),
      });
    },
  }),
);
```

Rules:
- Use `queryOptions()` / `mutationOptions()` from typed tRPC client.
- Prefer server-provided field errors first (`error.data?.zodError?...`).
- Add optimistic rollback (`onMutate` + `onError`) when doing optimistic UI.

## 8) Reusable checklist (for new projects)

1. Create request-scoped locale context (AsyncLocalStorage).
2. Wrap tRPC handler with locale context at request entry.
3. Build tRPC context with session + ability/capabilities.
4. Expose `public` and `auth` procedures.
5. Validate every input with Zod.
6. Localize every server validation/business error with request locale.
7. Standardize `TRPCError` codes and keep error formatter consistent.
8. Enforce authorization in procedures and DB scope filtering.
9. Use typed client `queryOptions()` / `mutationOptions()`.
10. Show field errors from `error.data.zodError` with generic fallback toast.

## 9) Anti-patterns to avoid

- Hardcoded server error messages (e.g., `"Category not found"`).
- Checking permissions only in UI.
- Calling ad-hoc fetch for tRPC endpoints from components.
- Skipping input validation in mutations.
- Swallowing errors and returning success-like defaults.

---

If you replicate these patterns, you get:
- consistent localization across clients,
- predictable error contracts,
- safer authorization boundaries,
- and strongly-typed end-to-end query/mutation flows.