# Builder Apps

This folder is where Overbase wires builder apps into the product.

Builder apps run outside Overbase. Overbase stores local presentation metadata, then fetches each app's manifest and calls each app's runtime over HTTP.

## Custom Builder

The custom email format builder lives in:

```text
/Users/juliennewman/Documents/custom-builder
```

It uses the app slug:

```text
custom-builder
```

Required Overbase env:

```text
CUSTOM_BUILDER_RUNTIME_URL
CUSTOM_BUILDER_RUNTIME_SECRET
```

The secret must match `CUSTOM_BUILDER_OVERBASE_SECRET` in the custom builder app.

## Bring the Firm Builder

The Bring the Firm builder lives in:

```text
/Users/juliennewman/Documents/bring-the-firm-builder
```

It uses the app slug:

```text
bring-the-firm-builder
```

Required Overbase env:

```text
BRING_THE_FIRM_BUILDER_RUNTIME_URL
BRING_THE_FIRM_BUILDER_RUNTIME_SECRET
```

The secret must match `BRING_THE_FIRM_BUILDER_OVERBASE_SECRET` in the Bring the Firm builder app.

## External Builder Apps

Files:

- `ids.ts`: app slugs.
- `presentation.ts`: gallery metadata, categories, artwork, sort order.
- `runtime-config.ts`: runtime URL and secret env names per app slug.
- `runtime-core.ts`: external app registry/env wrapper that calls SDK runtime transport helpers.
- `runtime.server.ts`: SvelteKit manifest loader.
- `src/backend/builder-sessions/runtime.ts`: Overbase session job to external runtime adapter.

Load path:

- `/builders` calls `runtime.server.ts`.
- `runtime.server.ts` asks `runtime-core.ts` to fetch each external app manifest.
- If an external app cannot be reached, it is skipped on `/builders`.
- Opening a specific external app still requires that app runtime to be available.

Run path:

- Convex internal builder-session actions call `src/backend/builder-sessions/runtime.ts`.
- `src/backend/builder-sessions/runtime.ts` sends builder jobs through `runtime-core.ts`.
- `runtime-core.ts` uses the SDK transport helpers to sign requests and call the external runtime HTTP endpoint.

Required env per external app:

```text
BRING_THE_FIRM_BUILDER_RUNTIME_URL
BRING_THE_FIRM_BUILDER_RUNTIME_SECRET
CUSTOM_BUILDER_RUNTIME_URL
CUSTOM_BUILDER_RUNTIME_SECRET
```

## Runtime Shape

External builder apps own their product code, runtime logic, and HTTP layer.

Inside each external app:

- `src/builder/` contains the manifest, examples, rules, and engine.
- `src/runtime/operations.ts` contains `startTurn`, `continueTurn`, and optional `backgroundJob`.
- The SDK route adapters handle HTTP signing and NDJSON streaming because Overbase calls the app over HTTP.
- `/api/builder/manifest` exposes the app manifest.
- `/api/builder/start-turn`, `/api/builder/continue-turn`, and `/api/builder/background-job` expose runtime operations.
