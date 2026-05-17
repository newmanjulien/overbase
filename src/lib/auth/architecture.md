# Auth Boundary

Overbase keeps app authorization in Convex.

- Clerk owns browser identity: sign in, sign up, sessions, and browser JWT issuance.
- Convex owns app auth: users, workspaces, authorization checks, and workspace bootstrap.
- SvelteKit server routes are public by default unless a route is explicitly designed as a server-side protected boundary.

Do not add global Clerk server auth back to SvelteKit. Client code should pass Clerk's `convex`
JWT template token into Convex, then use Convex functions as the app authorization boundary.
