# Builder Apps

This folder is where Overbase wires builder apps into the product.

There are two paths:

- `custom-notification` runs inside this repo.
- Blueprint apps run somewhere else and Overbase calls them over HTTP.

## Custom Notification

The custom notification builder is built into Overbase.

Files:

- `custom-notification/definition.ts`: app manifest.
- `custom-notification/runtime.ts`: runtime entrypoint with `startTurn`, `continueTurn`, and `backgroundJob`.
- `custom-notification/engine/`: OpenAI workflow.
- `custom-notification/rules/`: prompts and rules.
- `custom-notification/examples/`: example notifications used by the workflow.

Load path:

- `/builder/custom-notification` asks `runtime.server.ts` for the manifest.
- `runtime.server.ts` returns the local manifest from `custom-notification/definition.ts`.
- Convex jobs ask `src/convex/builderRuntime.ts` for the runtime.
- `src/convex/builderRuntime.ts` returns the local runtime from `custom-notification/runtime.ts`.

Required env:

```text
OPENAI_API_KEY
```

Set this in the Convex dev environment, because Convex runs the custom notification jobs.

## Blueprint Apps

Blueprint apps are external apps. Overbase stores their local display metadata, but the actual app manifest and runtime are fetched from the external app.

Files:

- `ids.ts`: app slugs.
- `presentation.ts`: gallery metadata, categories, artwork, sort order.
- `runtime-core.ts`: HTTP client for external apps.
- `runtime.server.ts`: SvelteKit manifest loader.
- `src/convex/builderRuntime.ts`: Convex runtime selector.

Load path:

- `/builder` calls `runtime.server.ts`.
- `runtime.server.ts` asks `runtime-core.ts` to fetch each external app manifest.
- If an external app cannot be reached, it is skipped on `/builder`.
- Opening a specific external app still requires that app runtime to be available.

Run path:

- Convex jobs call `src/convex/builderRuntime.ts`.
- `src/convex/builderRuntime.ts` sends blueprint jobs through `runtime-core.ts`.
- `runtime-core.ts` signs the request and calls the external runtime HTTP endpoint.

Required env per external app:

```text
BRING_THE_FIRM_RUNTIME_URL
BRING_THE_FIRM_RUNTIME_SECRET
```
