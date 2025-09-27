# 📐 Conventions: Dates & Defaults

This doc defines how we handle **dates** across the app.  
It exists so contributors don’t reintroduce Firestore leaks or duplicate logic in screens.

---

## 🎯 TL;DR

- **UI / Stores**: use `Date | null`
- **Services**: serialize `Date → "yyyy-MM-dd"` before Firestore
- **Model (converter)**: deserialize `"yyyy-MM-dd" → Date`
- **Firestore**: never stores raw `Date`, only `"yyyy-MM-dd"` strings

👉 Side rule: text fields (`prompt`, `q1`, `q2`, `q3`) must never be `undefined`.  
Empty = `""`.

---

## 🌍 Big Picture

- **UI / Screens**

  - Work only with `Date | null` for dates.
  - Never worry about Firestore rules (no serialization).
  - Just pass state values from stores → services.

- **Stores (Zustand)**

  - Initialize dates as `Date | null`.
  - Hydrate from model objects (never directly from Firestore snapshots).

- **Model / Converter (`request.ts`)**

  - Defines the canonical `Request` type.
  - **Reads (`fromFirestore`)**:
    - `scheduledDate`: convert `"yyyy-MM-dd"` string → `Date`.
  - **Writes (`toFirestore`)**:
    - `scheduledDate`: convert `Date` → `"yyyy-MM-dd"` string.

- **Service Layer (`requestService.ts`)**
  - Responsible for all persistence-side normalization.
  - **On write**:
    - Always serialize `scheduledDate` before sending to Firestore.
    - Never pass raw `Date`.
  - **On read**:
    - Always use `.withConverter(requestConverter)` to get a proper `Request`.

---

## ✅ Example Flow

1. **UI** (`SetupClient`):

   ```ts
   updateActive(uid, id, { scheduledDate });
   ```

2. **Store**:
   scheduledDate = null by default.

3. **Service** (`updateActive`):
   await updateDoc(ref, {
   scheduledDate: data.scheduledDate
   ? serializeScheduledDate(data.scheduledDate)
   : null,
   updatedAt: serverTimestamp(),
   });

4. **Firestore stores only**:
   scheduledDate: "yyyy-MM-dd" string.

5. **Model / Converter**:
   scheduledDate: d.scheduledDate
   ? deserializeScheduledDate(d.scheduledDate)
   : null,

6. **UI always gets back a safe Request**:
   UI always gets back a safe Date | null.

---

## 🔄 Flow Diagram

[ UI / Screens ]
| (Date | null)
v
[ Stores (Zustand) ]
| (safe default: null)
v
[ Service Layer ]
| (serialize Date → "yyyy-MM-dd")
v
[ Firestore ]
| ("yyyy-MM-dd" string, null, FieldValue)
v
[ Converter (request.ts) ]
| (deserialize string → Date)
v
[ Back to UI as Date | null ]

---

## ❌ Anti-Patterns

**Passing raw Date to Firestore**:
// ❌ Wrong
scheduledDate: someDateObject,

**Screens serializing datese**:
// ❌ Wrong
scheduledDate: serializeScheduledDate(date),

**Text fields as undefineds**:
Firestore rejects undefined. Use "" for empty strings.
