# Builder Apps

This folder is where Overbase wires builder apps into the product.

There are two paths:

- `custom-opportunity-format` runs inside this repo.
- External builder apps run somewhere else and Overbase calls them over HTTP.

## Custom Opportunity Format

The custom opportunity format builder is built into Overbase.

Files:

- `custom-opportunity-format/definition.ts`: app manifest.
- `custom-opportunity-format/runtime.ts`: runtime entrypoint with `startTurn`, `continueTurn`, and `backgroundJob`.
- `custom-opportunity-format/engine/`: OpenAI workflow.
- `custom-opportunity-format/rules/`: prompts and rules.
- `custom-opportunity-format/examples/`: example formats used by the workflow.

Load path:

- `/builders/custom-opportunity-format` asks `runtime.server.ts` for the manifest.
- `runtime.server.ts` returns the local manifest from `custom-opportunity-format/definition.ts`.
- Convex jobs ask `src/convex/builderRuntime.ts` for the runtime.
- `src/convex/builderRuntime.ts` returns the local runtime from `custom-opportunity-format/runtime.ts`.

Required env:

```text
OPENAI_API_KEY
```

Set this in the Convex dev environment, because Convex runs the custom opportunity format jobs.

## External Builder Apps

External builder apps are external apps. Overbase stores their local display metadata, but the actual app manifest and runtime are fetched from the external app.

Files:

- `ids.ts`: app slugs.
- `presentation.ts`: gallery metadata, categories, artwork, sort order.
- `runtime-core.ts`: external app registry/env wrapper that calls SDK runtime transport helpers.
- `runtime.server.ts`: SvelteKit manifest loader.
- `src/convex/builderRuntime.ts`: Convex runtime selector.

Load path:

- `/builders` calls `runtime.server.ts`.
- `runtime.server.ts` asks `runtime-core.ts` to fetch each external app manifest.
- If an external app cannot be reached, it is skipped on `/builders`.
- Opening a specific external app still requires that app runtime to be available.

Run path:

- Convex jobs call `src/convex/builderRuntime.ts`.
- `src/convex/builderRuntime.ts` sends external builder jobs through `runtime-core.ts`.
- `runtime-core.ts` uses the SDK transport helpers to sign requests and call the external runtime HTTP endpoint.

Required env per external app:

```text
BRING_THE_FIRM_RUNTIME_URL
BRING_THE_FIRM_RUNTIME_SECRET
```

## Runtime Shapes

The custom opportunity format runtime is a file because it is part of Overbase.
Convex imports `custom-opportunity-format/runtime.ts` and calls `startTurn`, `continueTurn`,
and `backgroundJob` directly.

External builder app runtimes usually live in their own apps. In those apps, `runtime` is a
folder because it includes both the app's real runtime logic and the HTTP layer that
lets Overbase call it.

For example, in Bring the Firm:

- `src/runtime/operations.ts` is the real runtime logic. It is the closest match to
  `custom-opportunity-format/runtime.ts`.
- The SDK route adapters handle the HTTP signing and NDJSON streaming layer because
  Overbase calls the app over HTTP.
- `src/routes/api/builder/*` exposes the runtime endpoints that Overbase calls.

So the difference is not that Bring the Firm has a different kind of builder brain.
It has the same runtime shape at the center, but it also needs hosting code around
it because it runs outside Overbase.
