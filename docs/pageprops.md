# Next.js 15 PageProps (`params`) Changes

## What happened

In **Next.js 15**, the `params` (and `searchParams`) objects that are
passed into App Router pages are no longer synchronous objects.\
They are now **Promises** that must be awaited.

This is a breaking change compared to Next.js 14.

### Example of the type change

- **Before (Next.js 14)**

  ```ts
  interface PageProps {
    params: { id: string };
  }
  ```

- **After (Next.js 15)**

  ```ts
  interface PageProps {
    params: Promise<{ id: string }>;
  }
  ```

If you don't make this change, you'll see type errors like:

    Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally...

---

## What we changed

We updated our dynamic route pages to:

1.  **Type `params` as a promise**

    ```ts
    interface SetupPageProps {
      params: Promise<{ id: string }>;
    }
    ```

2.  **Make the page component `async`**

    ```ts
    export default async function SetupPage({ params }: SetupPageProps) {
      const { id } = await params;
      ...
    }
    ```

3.  **Leave downstream client components unchanged**\
    `OverviewClient` and `SetupClient` continue to receive a fully
    resolved `connector` object.

---

## Updated files

- `src/app/dashboard/connectors/[id]/page.tsx`
- `src/app/dashboard/connectors/[id]/setup/page.tsx`
- `src/app/dashboard/requests/[id]/setup/page.tsx`
- `src/app/dashboard/requests/[id]/questions/page.tsx`

These pages now `await params` before using them.

---

## Why we did it this way

- ✅ **Aligns with Next.js 15 contract**: avoids type errors and
  ensures consistency with `PageProps`.
- ✅ **Keeps client code simple**: `OverviewClient` and `SetupClient`
  don't need to handle promises.
- ✅ **Minimal changes**: only the page entrypoints were touched.

---

## Alternatives we considered

- **Unwrapping `params` in a client component using `use()`**\
  This works, but would require changing `OverviewClient` and
  `SetupClient` to accept promises.\
  → Rejected for added complexity.

- **Running the Next.js codemod**
  (`npx @next/codemod@canary next-async-request-api`)\
  This can fix many pages automatically, but we preferred a manual
  update here for clarity and control.

---

## Key takeaway for future devs

When writing a new page in `app/` that uses route parameters:

- Always mark the page function `async`.
- Always `await params` (and `searchParams` if used).
- Keep downstream components expecting plain objects.

Example boilerplate for a dynamic route page:

```ts
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // your logic here
}
```

---

👉 This should prevent confusion for anyone hitting the `Promise<any>`
error in the future.
