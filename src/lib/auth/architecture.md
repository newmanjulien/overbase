# Auth Boundary

Overbase keeps app authorization in Convex.

- Clerk owns browser identity: sign in, sign up, sessions, and browser JWT issuance.
- Convex owns app auth: users, workspaces, authorization checks, and workspace bootstrap.
- SvelteKit server routes are public by default unless a route is explicitly designed as a server-side protected boundary.

Do not add global Clerk server auth back to SvelteKit. Client code should pass Clerk's `convex`
JWT template token into Convex, then use Convex functions as the app authorization boundary.

## Client Modules

- `AppAuthGate.svelte` decides whether to show the app, login, onboarding, loading, or error state.
- `login/` owns credential entry for existing users.
- `onboarding/` owns join, workspace onboarding, and first builder selection.
- `components/` owns shared auth UI primitives used by login and onboarding.
- `navigation.ts` owns auth entry route helpers and return destination handling.
- `email-code-auth.ts` owns Clerk email-code mechanics shared by login and join.
