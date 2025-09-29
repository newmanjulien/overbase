# Request System – Design Principles

✅ **Summary**

- **Zustand**: a bridge between screens, not persistence.
- **Firestore**: the single source of truth.
- **Controlled inputs**: transient local state → persist on blur/debounce.
- **UI flows**: just different views of the same Firestore-backed data.

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

❌ **DON’T**

- Leave important state in memory only.
- Depend on manual “save” actions for persistence.

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

- Persist form values to Firestore with **debounce** (e.g. 800ms).
- Ensure data is always recoverable after a refresh.

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

## 🔹 Separation of Concerns

✅ **DO**

- Keep layers distinct:
  - **Service layer** → Firestore CRUD
  - **Store** → state + subscriptions
  - **Client components** → orchestrate store + local form state
  - **UI components** → pure presentation

❌ **DON’T**

- Put Firestore logic directly into UI components.
- Mix rendering concerns into the store.

---

## 🔹 Data Modeling

✅ **DO**

- Organize requests around **scheduledDate** (calendar-first).
- Use `requestsByDate` consistently for UI.
- Maintain TypeScript interfaces (`RequestItem`) as the contract.

❌ **DON’T**

- Scatter date-handling logic across components.
- Duplicate model definitions.

---

## 🔹 UX Consistency

✅ **DO**

- Reuse patterns (status toggle, delete confirm, SetupLayout).
- Keep “draft/active” semantics identical across Setup and Questions.
- Ensure “everything is always saved” is consistent across screens.

❌ **DON’T**

- Create different metaphors for saving/editing in different places.
- Break user expectations about persistence.
