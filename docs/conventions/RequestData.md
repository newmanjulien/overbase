# Request System – Design Principles

✅ **Overview**

- **Zustand**: a bridge between screens, not persistence.
- **Firestore**: the single source of truth.
- **Controlled inputs**: transient local state → persist on blur/debounce.
- **UI flows**: just different views of the same Firestore-backed data.
- **RichText editor**: dual-storage model (`prompt`, `promptRich`) with autosave.
- **Summarisation API**: derives `summary` from `prompt` only.
- **Ephemeral drafts**: client-only placeholder records prior to Firestore persistence.

---

## 🔹 State Management

✅ **DO**

- Use **Zustand** (`useRequestListStore`) as the single shared store for all requests.
- Treat Zustand as a **view-layer cache**, not a database.
- Use it to share state across screens (`Dashboard`, `Setup`, `Questions`).

❌ **DON’T**

- Store long-term or business-critical state only in Zustand.
- Create multiple overlapping global stores for requests.

---

## 🔹 Persistence

✅ **DO**

- Use **Firestore** as the **single source of truth**.
- Persist all drafts and edits via the store’s service functions (`createDraft`, `updateActive`, `submitDraft`, etc.).
- Keep Firestore in sync via snapshot subscriptions.
- When persisting request data that includes rich text, **save both `prompt` and `promptRich` together**.
- Support an optional `ephemeral: true` flag on client-side drafts to indicate a request that has not yet been fully persisted to Firestore.
- Use `ephemeral` **only on the client** to track transient or optimistic records (e.g., drafts created offline or before confirmation).
- Ensure that the admin or server write path removes the flag once the document is officially saved.

❌ **DON’T**

- Leave important state in memory only.
- Depend on manual “save” actions for persistence.
- Send `promptRich` directly to APIs.
- Persist `ephemeral: true` records permanently in Firestore.
- Depend on the flag for business logic — treat it as a transient client hint only.

---

## 🔹 Local Form Inputs

✅ **DO**

- Use **controlled inputs** with transient `localValue` (`useState`) for responsiveness.
- Write changes back to Firestore through the `ListStore` on **blur** or after a **debounce**.
- Keep the store as a persistence bridge, not as the direct binding for inputs.

❌ **DON’T**

- Bind form inputs directly to store state (too chatty, introduces lag).
- Push every keystroke straight to Firestore.

---

## 🔹 Auto-Save

✅ **DO**

- Persist form values to Firestore with **debounce** (≈800ms).
- Ensure data is always recoverable after a refresh.
- For **Lexical-based editors**, debounce both the plain and serialized (`prompt` and `promptRich`) states together.
- Prevent autosave during Firestore hydration.

❌ **DON’T**

- Require the user to explicitly “Save draft.”
- Allow edits to linger unsaved in local state.

---

## 🔹 Workflow

✅ **DO**

- Model request lifecycle as:  
  **Draft → Setup → Questions → Active**.
- Allow promotion/demotion between draft and active.
- Drive UI navigation from this lifecycle.

❌ **DON’T**

- Introduce hidden or one-off states outside Firestore.
- Tie screens too tightly together — each should stand alone.

---

## 🔹 Derived Data (`summary`, `summarySourcePrompt`)

✅ **DO**

- Use `/api/summarise` to derive summaries from `prompt` (plain text only).
- Store results in Firestore as `summary`, `summaryStatus`, and `summarySourcePrompt`.
- Support both server-side and client-side Firestore updates (via `serverUpdated` flag).

❌ **DON’T**

- Summarize from `promptRich` (it’s structured JSON, not text).
- Depend on unsaved summaries — always persist results.

---

## 🔹 Rich Text Fields (`prompt` / `promptRich`)

✅ **DO**

- Store both:
  - `prompt`: the plain text representation (used for summaries, search, and display).
  - `promptRich`: the serialized Lexical state (used for rehydration and mentions).
- Treat **`promptRich` as the source of truth**.
- Derive `prompt` from `promptRich` on change.
- Persist both fields together in Firestore.

❌ **DON’T**

- Update one without the other.
- Send `promptRich` to APIs or use it in AI summaries.

---

## 🔹 Separation of Concerns

✅ **DO**

- Keep layers distinct:
  - **Service layer** → Firestore CRUD
  - **Store** → state + subscriptions
  - **Client components** → orchestrate store + local form state
  - **UI components** → pure presentation
- Keep Lexical (RichText) serialization logic inside client components — Firestore and APIs should handle only plain text.

❌ **DON’T**

- Put Firestore logic directly into UI components.
- Mix rendering concerns into the store.

---

## 🔹 Data Modeling

✅ **DO**

- Organize requests around **scheduledDate** (calendar-first).
- Use `requestsByDate` consistently for UI.
- Maintain TypeScript interfaces (`RequestItem`) as the contract.
- Include dual prompt fields (`prompt`, `promptRich`) and summary data.
- Support an optional `ephemeral` flag for transient client-side drafts.

❌ **DON’T**

- Scatter date-handling logic across components.
- Duplicate model definitions.

### Example RequestItem (Updated)

```ts
interface RequestItem {
  id: string;
  uid: string;
  status: "draft" | "active";
  customer: string;
  prompt: string;
  promptRich: SerializedEditorState | null;
  summary: string;
  summarySourcePrompt: string;
  summaryStatus: "pending" | "ready" | "failed";
  scheduledDate: Date | null;
  repeat: string;
  ephemeral?: boolean; // true only for client-local drafts
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

> **Note:**  
> `ephemeral` is a **client-only flag** indicating a locally created or optimistic draft.  
> It should never be relied on for logic in admin or backend systems. When the record is successfully written to Firestore, `ephemeral` must be removed or ignored by the server.

---

## 🔹 UX Consistency

✅ **DO**

- Reuse patterns (status toggle, delete confirm, SetupLayout).
- Keep “draft/active” semantics identical across Setup and Questions.
- Ensure “everything is always saved” is consistent across screens.

❌ **DON’T**

- Create different metaphors for saving/editing in different places.
- Break user expectations about persistence.
