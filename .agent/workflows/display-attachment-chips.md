---
description: Add attachment chips to user response cards in the answers view
---

# Display Attachment Chips on User Response Cards

## Overview

When users ask questions or follow-ups, they can attach KPIs, People, and Files via the QuestionModal/FollowupModal. These attachments are stored in the `answers` table but are not currently displayed in the answers view. This plan adds read-only attachment chips to user response cards.

## Current State

- `AttachmentChip` component exists at `src/components/modals/shared/AttachmentChip.tsx`
- Has `onRemove` prop (required) - designed for editing, not display
- Attachments stored on `answers` table: `attachedKpis`, `attachedPeople`, `attachedFiles`
- `deriveThread()` in `thread.ts` doesn't include attachments
- `AnswerCard` component doesn't render attachments

## Target State

- User response cards (`type: "response"` where `sender === "user"`) display attachment chips
- Chips are read-only (no X button)
- Chips appear below the content text, similar to modal preview

---

## Phase 1: Create Display Chip Component

**Goal:** Create a read-only version of AttachmentChip for display purposes.

### Option A: Modify existing AttachmentChip (Recommended)

Make `onRemove` optional and conditionally render the X button.

**File:** `src/components/modals/shared/AttachmentChip.tsx`

**Changes:**

```tsx
interface AttachmentChipProps {
  icon: ReactNode;
  label: string;
  onRemove?: () => void; // Make optional
}

export function AttachmentChip({ icon, label, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-800">
      {icon}
      <span className="max-w-[200px] truncate">{label}</span>
      {onRemove && ( // Conditionally render
        <button
          onClick={onRemove}
          className="text-gray-800 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
```

### Verification

- Existing usages in QuestionModal and FollowupModal still work (they pass onRemove)
- No TypeScript errors

---

## Phase 2: Update Thread Types

**Goal:** Add attachment fields to the thread types so they flow through `deriveThread()`.

### 2a. Update `ThreadAnswer` interface

**File:** `src/lib/questions/thread.ts`

**Add to `ThreadAnswer`:**

```ts
export interface ThreadAnswer {
  _id: string;
  sender: Sender;
  content?: string;
  privacy: Privacy;
  tableData?: TableRow[];
  cancelledAt?: number;
  // NEW: Attachment fields
  attachedKpis?: {
    metric: string;
    definition: string;
    antiDefinition: string;
  }[];
  attachedPeople?: { id: string; name: string }[];
  attachedFiles?: { fileName: string; context?: string }[];
}
```

### 2b. Update `AnswerCard` type (in thread.ts)

**Add attachments to `AnswerCard` type:**

```ts
export type AnswerCard = {
  type: "response";
  answerId: string;
  sender: Sender;
  content: string;
  privacy: Privacy;
  tableData?: TableRow[];
  showMenu?: boolean;
  // NEW: Attachment fields (only populated for user messages)
  attachedKpis?: {
    metric: string;
    definition: string;
    antiDefinition: string;
  }[];
  attachedPeople?: { id: string; name: string }[];
  attachedFiles?: { fileName: string; context?: string }[];
};
```

### Verification

- TypeScript compiles without errors
- No changes to runtime behavior yet

---

## Phase 3: Update deriveThread Function

**Goal:** Pass attachments from answers to the card output.

**File:** `src/lib/questions/thread.ts`

**In the `deriveThread` function, update the answer card creation:**

```ts
// Current (around line 121-134):
thread.push({
  type: "response",
  answerId: answer._id,
  sender: answer.sender,
  content: answer.content ?? "",
  privacy: answer.privacy,
  tableData: answer.tableData,
  showMenu: isLastAnswerCard && shouldShowMenu,
});

// Updated:
thread.push({
  type: "response",
  answerId: answer._id,
  sender: answer.sender,
  content: answer.content ?? "",
  privacy: answer.privacy,
  tableData: answer.tableData,
  showMenu: isLastAnswerCard && shouldShowMenu,
  // Pass attachments only for user messages
  ...(answer.sender === SENDER.USER && {
    attachedKpis: answer.attachedKpis,
    attachedPeople: answer.attachedPeople,
    attachedFiles: answer.attachedFiles,
  }),
});
```

### Verification

- TypeScript compiles
- `deriveThread` now includes attachment data in output

---

## Phase 4: Update AnswerCard Props

**Goal:** Add attachment props to the AnswerCard component.

**File:** `src/app/dashboard/questions/[id]/AnswerCard.tsx`

### 4a. Update `AnswerCardVariantProps` type:

```ts
type AnswerCardVariantProps = {
  type: "response";
  answerId: string;
  sender: Sender;
  content: string;
  privacy: Privacy;
  tableData?: { ... }[];
  onPrivacyChange: (newPrivacy: Privacy) => void;
  onForward: () => void;
  showMenu?: boolean;
  // NEW:
  attachedKpis?: { metric: string; definition: string; antiDefinition: string }[];
  attachedPeople?: { id: string; name: string }[];
  attachedFiles?: { fileName: string; context?: string }[];
};
```

### 4b. Update deriveDisplayValues to include attachments:

In the `DerivedValues` interface in AnswerCard.tsx:

```ts
interface DerivedValues {
  // ... existing fields
  attachedKpis?: {
    metric: string;
    definition: string;
    antiDefinition: string;
  }[];
  attachedPeople?: { id: string; name: string }[];
  attachedFiles?: { fileName: string; context?: string }[];
}
```

In the `deriveDisplayValues` function, for the "response" case:

```ts
case "response":
  return {
    topLabel: SENDER_LABEL[props.sender],
    subLabel: undefined,
    content: props.content,
    privacy: props.privacy,
    avatar: props.sender === "user" ? userAvatar : overbaseIcon,
    avatarFallback: props.sender === "user" ? "U" : "AI",
    tableData: props.tableData,
    // NEW: Pass attachments only for user messages
    ...(props.sender === "user" && {
      attachedKpis: props.attachedKpis,
      attachedPeople: props.attachedPeople,
      attachedFiles: props.attachedFiles,
    }),
  };
```

### Verification

- TypeScript compiles
- Props are wired through

---

## Phase 5: Render Attachment Chips in AnswerCard

**Goal:** Display the chips in the card UI.

**File:** `src/app/dashboard/questions/[id]/AnswerCard.tsx`

### 5a. Add import for AttachmentChip and icons:

```tsx
import { AttachmentChip } from "@/components/modals/shared/AttachmentChip";
import { BarChart3, Users, FileText } from "lucide-react";
```

### 5b. Add chip rendering after the content section:

```tsx
{
  /* Main content */
}
{
  derived.content && (
    <div className="text-sm text-gray-800 mt-3">
      <p className="text-gray-700 text-sm leading-relaxed">{derived.content}</p>
    </div>
  );
}

{
  /* NEW: Attachment chips (for user responses only) */
}
{
  (derived.attachedKpis?.length ||
    derived.attachedPeople?.length ||
    derived.attachedFiles?.length) && (
    <div className="flex flex-wrap gap-2 mt-3">
      {derived.attachedKpis?.map((kpi, idx) => (
        <AttachmentChip
          key={`kpi-${idx}`}
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          label={kpi.metric}
        />
      ))}
      {derived.attachedPeople?.map((p, idx) => (
        <AttachmentChip
          key={`people-${idx}`}
          icon={<Users className="h-3.5 w-3.5" />}
          label={p.name}
        />
      ))}
      {derived.attachedFiles?.map((f, idx) => (
        <AttachmentChip
          key={`file-${idx}`}
          icon={<FileText className="h-3.5 w-3.5" />}
          label={f.fileName}
        />
      ))}
    </div>
  );
}
```

### Verification

- Chips render for user response cards with attachments
- No chips shown for Overbase response cards
- No chips shown for cards without attachments

---

## Phase 6: Update Answer.tsx to Pass Attachments

**Goal:** Ensure attachments flow from thread to AnswerCard component.

**File:** `src/app/dashboard/questions/[id]/Answer.tsx`

**In the `case "response":` section, add the new props:**

```tsx
case "response":
  return (
    <AnswerCard
      key={card.answerId}
      type="response"
      answerId={card.answerId}
      sender={card.sender}
      content={card.content}
      privacy={card.privacy}
      tableData={card.tableData}
      onPrivacyChange={(newPrivacy) =>
        onPrivacyChange(card.answerId as Id<"answers">, newPrivacy)
      }
      onForward={onForward}
      showMenu={card.showMenu}
      // NEW:
      attachedKpis={card.attachedKpis}
      attachedPeople={card.attachedPeople}
      attachedFiles={card.attachedFiles}
    />
  );
```

### Verification

- Full data flow complete
- Test with actual attachments in database

---

## Phase 7: Testing & Verification

### Manual Testing Checklist

1. **Create a new question with attachments via QuestionModal**
   - Add a KPI, a Person, and a File
   - Submit the question
   - Navigate to the answers view
   - Verify: Original question card shows all 3 chip types

2. **Create a follow-up with attachments via FollowupModal**
   - Open an existing answered thread
   - Click FollowupBar
   - Add attachments
   - Submit
   - Verify: Follow-up card shows chips

3. **Verify Overbase responses don't show chips**
   - Check that AI response cards don't display any attachment chips

4. **Verify styling**
   - Chips should match modal preview styling
   - No X button visible on chips
   - Proper spacing and wrapping

5. **Edge cases**
   - Question with no attachments: no chip row shown
   - Question with only KPIs: only KPI chips shown
   - Long attachment labels: properly truncated

---

## Files Modified

| Phase | File                                              | Change Type              |
| ----- | ------------------------------------------------- | ------------------------ |
| 1     | `src/components/modals/shared/AttachmentChip.tsx` | Modify                   |
| 2     | `src/lib/questions/thread.ts`                     | Modify (types)           |
| 3     | `src/lib/questions/thread.ts`                     | Modify (deriveThread)    |
| 4     | `src/app/dashboard/questions/[id]/AnswerCard.tsx` | Modify (types & derived) |
| 5     | `src/app/dashboard/questions/[id]/AnswerCard.tsx` | Modify (render)          |
| 6     | `src/app/dashboard/questions/[id]/Answer.tsx`     | Modify (props)           |

---

## Rollback Plan

If issues arise:

1. Revert AttachmentChip changes (make onRemove required again)
2. Remove attachment fields from thread types
3. Remove attachment rendering from AnswerCard
4. Remove attachment props from Answer.tsx

No database changes required - data is already stored correctly.
