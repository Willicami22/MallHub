# Forms Architecture Guide (AI-Optimized)

This guide defines the required form architecture used in this codebase.

## 1) Non-negotiable rules

1. **TanStack Form is mandatory** for all interactive forms. Do not build form state with ad-hoc `useState`.
2. Every form must have a dedicated `*.form.ts` module (for example `app/features/login/login.form.ts`).
3. In each `*.form.ts`, define:
   - `createFormHookContexts()` + `createFormHook(...)`
   - a Zod **state** schema (UI shape)
   - a Zod **data** schema (submit payload)
   - a `z.codec(stateSchema, dataSchema, { decode, encode })`
   - `formOptions({ defaultValues, validators... })`
4. UI components must use the generated hooks/HOC (`useXForm`, `withXForm`) and `form.Field`.
5. All user-facing validation/error copy must use Paraglide messages (`m.*`).

## 2) Standard file pattern

Use this structure for every new form:

1. `feature.form.ts` (form contract and exports)
2. `feature.page.tsx` or `components/*.tsx` (render fields + submit)
3. tRPC query/mutation hooks in page/component using `useTRPC`, `useQuery`, `useMutation`

Reference examples:
- Login: `app/features/login/login.form.ts`, `app/features/login/login.page.tsx`
- Register (multi-step): `app/features/register/register.form.ts`, `app/features/register/register.page.tsx`, `app/features/register/components/register-form-step1.tsx`, `app/features/register/components/register-form-step2.tsx`
- Profile (query + mutation): `app/features/dashboard/user/profile/dashboard-profile.form.ts`, `app/features/dashboard/user/profile/components/profile-form.component.tsx`
- Notifications saved search (JSON form + mutation errors): `app/features/dashboard/user/notifications/dashboard-notifications.form.ts`, `app/features/dashboard/user/notifications/dashboard-notifications.page.tsx`

## 3) TanStack Form usage (brief)

### 3.1 Form module (`*.form.ts`)

Define state/data boundaries explicitly:

- **State schema**: includes UI-only fields (toggles, steps, nullable select values, etc.).
- **Data schema**: strict payload for submit.
- **Codec**:
  - `decode`: state -> submit payload (trim/normalize/transform)
  - `encode`: payload -> state (for defaults and reset from server data)

Typical exported helpers:
- `toXSubmitData(state): XData | null` using `codec.safeDecode`
- `toXFormState(serverRecord): XState` for reset/prefill

### 3.2 UI fields

Render with `form.Field` and shared components (`Field`, `FieldLabel`, `FieldError`, `Input`, `Select`, `Checkbox`, etc.).  
Submit with:

```tsx
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  form.handleSubmit();
};
```

## 4) Mutations and queries pattern

For server-backed forms, use typed tRPC options from `useTRPC()`:

```tsx
const trpc = useTRPC();
const listQuery = useQuery(trpc.someFeature.list.queryOptions(input));
const saveMutation = useMutation(
  trpc.someFeature.save.mutationOptions({
    onSuccess: async () => {
      await appQueryClient.invalidateQueries({
        queryKey: trpc.someFeature.list.queryKey(),
      });
    },
    onError: () => {
      toast.error(m.someErrorMessage());
    },
  }),
);
```

Inside form `onSubmit`:
1. Convert with `toXSubmitData(value)`.
2. Stop if conversion fails (`null`).
3. Call `await mutation.mutateAsync(submitData)`.
4. Reset form or refetch data on success.

Real examples:
- Profile update + reset from canonical data: `profile-form.component.tsx`
- Saved searches create/update + cache invalidation: `dashboard-notifications.page.tsx`

## 5) Error handling contract

Use layered errors:

1. **Field validation errors (client)**: from Zod codec/validators -> `FieldError`.
2. **Submission field errors (server/business)**: map known API errors with `formApi.setErrorMap(...)` (see login/register).
3. **Global mutation errors**: toast fallback when no field mapping is available.
4. **Query errors**: explicit error UI (`Alert`) + retry action (`refetch`).

Optional extraction pattern for tRPC errors:
- Read `error.data.zodError` (see `getNotificationErrorMessage` in notifications page).

## 6) Multi-step form pattern (register)

Register uses form meta + control state:

- `formControls.step` in state schema
- `onSubmitMeta` and `meta.action` (`nextStep | previousStep | submit`)
- step components validate only relevant fields using `validators.onSubmit`

This keeps one form instance while splitting UI into steps.

## 7) Reusable checklist for new forms

1. Create `feature.form.ts` with state schema, data schema, codec, defaults, `formOptions`, hooks exports.
2. Use `useXForm` in container and `withXForm` for field sections.
3. Wire `form.handleSubmit()` in a native `<form onSubmit>`.
4. Use typed tRPC `queryOptions()`/`mutationOptions()` for server calls.
5. Localize all validation and feedback messages with `m.*`.
6. Handle loading, error, empty, success states explicitly.
7. Invalidate/refetch relevant queries after successful mutations.
