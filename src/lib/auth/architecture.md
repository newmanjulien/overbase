# Auth Boundary

Overbase keeps a strict identity/profile boundary: Clerk owns authentication identity;
Convex owns Overbase profile and workspace presentation.

- Clerk owns auth subject, sign-in email, sign in, sign up, sessions, and browser JWT issuance.
- Convex owns app auth: users, workspaces, authorization checks, and workspace bootstrap.
- Convex owns Overbase user profile data: display name and user avatar.
- Convex owns workspace profile data: workspace name and workspace avatar.
- SvelteKit server routes are public by default unless a route is explicitly designed as a server-side protected boundary.

Do not add global Clerk server auth back to SvelteKit. Client code should pass Clerk's `convex`
JWT template token into Convex, then use Convex functions as the app authorization boundary.

Clerk identity fields should enter app UI only through the typed viewer `identity` object
returned by Convex. That object currently contains the required sign-in email:

```ts
{
	identity: {
		email: string;
	}
}
```

Do not use Clerk name or avatar as Overbase profile state. Clerk name may be used only as
a private bootstrap seed when creating a new `users.displayName`; after that,
`users.displayName`, `users.avatar`, `workspaces.name`, and `workspaces.avatar` are the
presentation sources of truth.

## Client Modules

- `AppAuthGate.svelte` decides whether to show the app, login, onboarding, loading, or error state.
- `login/` owns credential entry for existing users.
- `onboarding/` owns join, workspace onboarding, and first builder selection.
- `components/` owns shared auth UI primitives used by login and onboarding.
- `navigation.ts` owns auth entry route helpers and return destination handling.
- `email-code-auth.ts` owns Clerk email-code mechanics shared by login and join.
