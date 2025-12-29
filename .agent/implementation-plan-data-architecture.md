# Implementation Plan: Data Architecture Refactor

## Overview

Refactor the Convex data model to properly separate thread metadata from message content, fix how data flows to the UI, and simplify the schema.

---

# Phase 1: Foundation (Types & Utilities)

**Goal:** Create new types and utility functions without breaking anything.

## 1.1 Update Type Definitions

**File:** `src/lib/questions/types.ts`

Add new types alongside existing ones (non-breaking):

```typescript
// NEW: Schedule types (matches dropdown options directly)
export interface SchedulePattern {
  frequency: "weekly" | "monthly" | "quarterly";

  // Weekly: which day (0=Sun, 6=Sat)
  dayOfWeek?: number;

  // Monthly: specific day (1-31, or -1 for last day)
  dayOfMonth?: number;

  // Monthly: nth weekday pattern (1-4)
  nthWeek?: number;

  // Quarterly: predefined day patterns
  quarterDay?: "first" | "last" | "second-month-first" | "third-month-first";

  // Quarterly: predefined weekday patterns
  quarterWeekday?: "first-monday" | "last-monday";

  // Data range in days
  dataRangeDays: number;
}

// NEW: Sender type (replaces topLabel)
export type MessageSender = "user" | "overbase";
```

## 1.2 Create Schedule Utility Functions

**File:** `src/lib/questions/scheduleUtils.ts` (NEW)

```typescript
import type { SchedulePattern } from "./types";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const ORDINALS = ["first", "second", "third", "fourth"];

/**
 * Format schedule for display in UI (pills, cards, etc.)
 */
export function formatScheduleDisplay(schedule: SchedulePattern): string {
  // Weekly
  if (schedule.frequency === "weekly" && schedule.dayOfWeek !== undefined) {
    return `Weekly on ${DAYS[schedule.dayOfWeek]}s`;
  }

  // Monthly - specific day
  if (schedule.frequency === "monthly" && schedule.dayOfMonth !== undefined) {
    if (schedule.dayOfMonth === -1) return "Monthly on the last day";
    return `Monthly on the ${schedule.dayOfMonth}${getOrdinalSuffix(schedule.dayOfMonth)}`;
  }

  // Monthly - nth weekday
  if (
    schedule.frequency === "monthly" &&
    schedule.nthWeek !== undefined &&
    schedule.dayOfWeek !== undefined
  ) {
    return `Monthly on the ${ORDINALS[schedule.nthWeek - 1]} ${DAYS[schedule.dayOfWeek]}`;
  }

  // Quarterly - day patterns
  if (schedule.frequency === "quarterly" && schedule.quarterDay) {
    const labels: Record<string, string> = {
      first: "First day of the quarter",
      last: "Last day of the quarter",
      "second-month-first": "First day of the second month",
      "third-month-first": "First day of the third month",
    };
    return labels[schedule.quarterDay] ?? "Quarterly";
  }

  // Quarterly - weekday patterns
  if (schedule.frequency === "quarterly" && schedule.quarterWeekday) {
    const labels: Record<string, string> = {
      "first-monday": "First Monday of the quarter",
      "last-monday": "Last Monday of the quarter",
    };
    return labels[schedule.quarterWeekday] ?? "Quarterly";
  }

  return capitalize(schedule.frequency);
}

/**
 * Calculate next delivery date from schedule (for helper text in UI)
 */
export function getNextDeliveryDate(
  schedule: SchedulePattern,
  fromDate: Date = new Date()
): Date {
  // Weekly
  if (schedule.frequency === "weekly" && schedule.dayOfWeek !== undefined) {
    const daysUntil = (schedule.dayOfWeek - fromDate.getDay() + 7) % 7 || 7;
    const next = new Date(fromDate);
    next.setDate(next.getDate() + daysUntil);
    return next;
  }

  // Monthly - specific day
  if (schedule.frequency === "monthly" && schedule.dayOfMonth !== undefined) {
    const next = new Date(fromDate);
    if (schedule.dayOfMonth === -1) {
      next.setMonth(next.getMonth() + 1, 0); // Last day
    } else {
      next.setDate(schedule.dayOfMonth);
      if (next <= fromDate) next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  // TODO: Implement monthly nth weekday and quarterly patterns
  return fromDate;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
```

## 1.3 Export from barrel

**File:** `src/lib/questions/index.ts`

Add exports for new utilities.

### Phase 1 Checklist

- [ ] Add `SchedulePattern` type
- [ ] Add `MessageSender` type
- [ ] Create `scheduleUtils.ts`
- [ ] Add exports to barrel file
- [ ] Verify no TypeScript errors

---

# Phase 2: Schema Migration

**Goal:** Update Convex schema and migrate existing data. This is the breaking change.

## 2.1 Update Questions Schema

**File:** `convex/schema.ts`

```typescript
// BEFORE
questions: defineTable({
  content: v.string(),
  status: v.union(v.literal("in-progress"), v.literal("completed")),
  privacy: v.union(v.literal("private"), v.literal("team")),
  tags: v.array(v.string()),
  questionType: v.union(v.literal("one-time"), v.literal("recurring")),
  schedule: v.optional(v.object({...old structure...})),
  attachedKpis: v.optional(...),
  attachedPeople: v.optional(...),
  attachedFiles: v.optional(...),
  cancelledAt: v.optional(v.number()),
})

// AFTER
questions: defineTable({
  privacy: v.union(v.literal("private"), v.literal("team")),

  schedule: v.optional(v.object({
    frequency: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("quarterly")),
    dayOfWeek: v.optional(v.number()),
    dayOfMonth: v.optional(v.number()),
    nthWeek: v.optional(v.number()),
    quarterDay: v.optional(v.union(
      v.literal("first"), v.literal("last"),
      v.literal("second-month-first"), v.literal("third-month-first")
    )),
    quarterWeekday: v.optional(v.union(
      v.literal("first-monday"), v.literal("last-monday")
    )),
    dataRangeDays: v.number(),
  })),

  cancelledAt: v.optional(v.number()),
})
```

**Removed:** `content`, `status`, `tags`, `questionType`, `attachedKpis`, `attachedPeople`, `attachedFiles`

## 2.2 Update Answers Schema

**File:** `convex/schema.ts`

```typescript
// BEFORE
answers: defineTable({
  questionId: v.id("questions"),
  topLabel: v.string(),
  content: v.optional(v.string()),
  privacy: v.union(v.literal("private"), v.literal("team")),
  tableData: v.optional(...),
}).index("by_questionId", ["questionId"])

// AFTER
answers: defineTable({
  questionThreadId: v.id("questions"),
  sender: v.union(v.literal("user"), v.literal("overbase")),
  content: v.optional(v.string()),
  privacy: v.union(v.literal("private"), v.literal("team")),
  tableData: v.optional(v.array(v.object({
    column1: v.string(),
    column2: v.string(),
    column3: v.string(),
    column4: v.string(),
    column5: v.string(),
  }))),
  attachedKpis: v.optional(v.array(v.object({
    metric: v.string(),
    definition: v.string(),
    antiDefinition: v.string(),
  }))),
  attachedPeople: v.optional(v.array(v.object({
    id: v.string(),
    name: v.string(),
  }))),
  attachedFiles: v.optional(v.array(v.object({
    fileName: v.string(),
    context: v.optional(v.string()),
  }))),
}).index("by_questionThreadId", ["questionThreadId"])
```

**Changes:** `questionId` → `questionThreadId`, `topLabel` → `sender`, added attachments

## 2.3 Data Migration Script

**File:** `convex/migrations/migrateToNewSchema.ts` (NEW)

```typescript
import { internalMutation } from "../_generated/server";

export const migrateQuestionsToNewSchema = internalMutation({
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").collect();

    for (const q of questions) {
      // 1. Create first answer from question content
      await ctx.db.insert("answers", {
        questionThreadId: q._id,
        sender: "user",
        content: q.content,
        privacy: q.privacy,
        attachedKpis: q.attachedKpis,
        attachedPeople: q.attachedPeople,
        attachedFiles: q.attachedFiles,
      });
    }

    // 2. Migrate existing answers: topLabel → sender
    const answers = await ctx.db.query("answers").collect();
    for (const a of answers) {
      if (a.topLabel) {
        const sender = a.topLabel === "You asked" ? "user" : "overbase";
        await ctx.db.patch(a._id, { sender });
      }
    }
  },
});
```

### Phase 2 Checklist

- [ ] Update `questions` schema (remove fields)
- [ ] Update `answers` schema (add fields, rename)
- [ ] Create migration script
- [ ] Run migration on dev database
- [ ] Verify data migrated correctly

---

# Phase 3: Backend (Queries & Mutations)

**Goal:** Update Convex queries and mutations to work with new schema.

## 3.1 Update Helper Functions

**File:** `convex/features/questions/helpers.ts`

```typescript
export async function enrichQuestionWithVariant(
  ctx: QueryCtx,
  question: Doc<"questions">
): Promise<QuestionVariant> {
  // Fetch all answers for this thread
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_questionThreadId", (idx) =>
      idx.eq("questionThreadId", question._id)
    )
    .order("asc")
    .collect();

  if (answers.length === 0) {
    throw new Error(`Question ${question._id} has no answers`);
  }

  // First answer = original question from user
  const firstAnswer = answers[0];

  // Last answer determines status
  const lastAnswer = answers[answers.length - 1];
  const status = lastAnswer.sender === "user" ? "in-progress" : "completed";

  // Find last Overbase answer for tableData
  const lastOverbaseAnswer = [...answers]
    .reverse()
    .find((a) => a.sender === "overbase");

  // Compute display privacy
  const answerPrivacies = answers.map((a) => a.privacy);
  const displayPrivacy = computeDisplayPrivacy(
    question.privacy,
    answerPrivacies
  );

  // Format dates
  const askedDate = formatAskedDate(firstAnswer._creationTime);

  // Build base
  const base = {
    ...question,
    displayContent: firstAnswer.content ?? "",
    askedDate,
    askedTimestamp: firstAnswer._creationTime,
    status,
    displayPrivacy,
    isRecurring: question.schedule !== undefined,
  };

  // Return appropriate variant
  if (base.isRecurring && question.schedule) {
    return {
      ...base,
      variant: "recurring" as const,
      frequency: question.schedule.frequency,
      scheduledDate: formatScheduleDisplay(question.schedule),
    };
  }

  if (status === "in-progress") {
    return { ...base, variant: "in-progress" as const };
  }

  return {
    ...base,
    variant: "answered" as const,
    tableData: (lastOverbaseAnswer?.tableData ?? []) as TableRow[],
  };
}
```

## 3.2 Update Mutations

**File:** `convex/features/questions/mutations.ts`

```typescript
export const createQuestion = mutation({
  args: {
    content: v.string(),
    privacy: v.union(v.literal("private"), v.literal("team")),
    schedule: v.optional(v.object({
      frequency: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("quarterly")),
      dayOfWeek: v.optional(v.number()),
      dayOfMonth: v.optional(v.number()),
      nthWeek: v.optional(v.number()),
      quarterDay: v.optional(v.union(
        v.literal("first"), v.literal("last"),
        v.literal("second-month-first"), v.literal("third-month-first")
      )),
      quarterWeekday: v.optional(v.union(
        v.literal("first-monday"), v.literal("last-monday")
      )),
      dataRangeDays: v.number(),
    })),
    attachedKpis: v.optional(v.array(...)),
    attachedPeople: v.optional(v.array(...)),
    attachedFiles: v.optional(v.array(...)),
  },
  handler: async (ctx, args) => {
    // 1. Create question (thread metadata only)
    const questionId = await ctx.db.insert("questions", {
      privacy: args.privacy,
      schedule: args.schedule,
    });

    // 2. Create first answer (user's question)
    await ctx.db.insert("answers", {
      questionThreadId: questionId,
      sender: "user",
      content: args.content,
      privacy: args.privacy,
      attachedKpis: args.attachedKpis,
      attachedPeople: args.attachedPeople,
      attachedFiles: args.attachedFiles,
    });

    return questionId;
  },
});

export const createAnswer = mutation({
  args: {
    questionThreadId: v.id("questions"),
    sender: v.union(v.literal("user"), v.literal("overbase")),
    content: v.optional(v.string()),
    privacy: v.union(v.literal("private"), v.literal("team")),
    tableData: v.optional(v.array(...)),
    attachedKpis: v.optional(v.array(...)),
    attachedPeople: v.optional(v.array(...)),
    attachedFiles: v.optional(v.array(...)),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("answers", args);
  },
});
```

## 3.3 Update Queries

**File:** `convex/features/questions/queries.ts`

```typescript
// Rename: getAnswersByQuestionId → getAnswersByThreadId
export const getAnswersByThreadId = query({
  args: { questionThreadId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("answers")
      .withIndex("by_questionThreadId", (q) =>
        q.eq("questionThreadId", args.questionThreadId)
      )
      .order("asc")
      .collect();
  },
});

// New filter queries
export const getRecurringQuestions = query({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").order("desc").collect();
    const recurring = questions.filter(
      (q) => !q.cancelledAt && q.schedule !== undefined
    );
    return Promise.all(recurring.map((q) => enrichQuestionWithVariant(ctx, q)));
  },
});

// REMOVE: getUniqueTags (no longer needed)
```

### Phase 3 Checklist

- [ ] Update `enrichQuestionWithVariant` helper
- [ ] Update `createQuestion` mutation
- [ ] Add `createAnswer` mutation
- [ ] Rename query to `getAnswersByThreadId`
- [ ] Add filter queries (recurring, this week, this month)
- [ ] Remove `getUniqueTags` query
- [ ] Verify all queries work

---

# Phase 4: Frontend - ScheduleModal

**Goal:** Rebuild the ScheduleModal with dropdown-based UI.

## 4.1 Define Dropdown Options

**File:** `src/components/modals/ScheduleModal/scheduleOptions.ts` (NEW)

```typescript
import type { SchedulePattern } from "@/lib/questions";

export interface DeliveryOption {
  label: string;
  value: Partial<SchedulePattern>;
}

export const WEEKLY_OPTIONS: DeliveryOption[] = [
  { label: "Sundays", value: { dayOfWeek: 0 } },
  { label: "Mondays", value: { dayOfWeek: 1 } },
  { label: "Tuesdays", value: { dayOfWeek: 2 } },
  { label: "Wednesdays", value: { dayOfWeek: 3 } },
  { label: "Thursdays", value: { dayOfWeek: 4 } },
  { label: "Fridays", value: { dayOfWeek: 5 } },
  { label: "Saturdays", value: { dayOfWeek: 6 } },
];

export const MONTHLY_OPTIONS: DeliveryOption[] = [
  { label: "First day of the month", value: { dayOfMonth: 1 } },
  { label: "First Monday of the month", value: { nthWeek: 1, dayOfWeek: 1 } },
  { label: "Second Monday of the month", value: { nthWeek: 2, dayOfWeek: 1 } },
  { label: "Third Monday of the month", value: { nthWeek: 3, dayOfWeek: 1 } },
  { label: "Fourth Monday of the month", value: { nthWeek: 4, dayOfWeek: 1 } },
  { label: "Last day of the month", value: { dayOfMonth: -1 } },
];

export const QUARTERLY_OPTIONS: DeliveryOption[] = [
  { label: "First day of the quarter", value: { quarterDay: "first" } },
  {
    label: "First Monday of the quarter",
    value: { quarterWeekday: "first-monday" },
  },
  {
    label: "First day of the second month",
    value: { quarterDay: "second-month-first" },
  },
  {
    label: "First day of the third month",
    value: { quarterDay: "third-month-first" },
  },
  {
    label: "Last Monday of the quarter",
    value: { quarterWeekday: "last-monday" },
  },
  { label: "Last day of the quarter", value: { quarterDay: "last" } },
];

export const DATA_RANGE_OPTIONS: DeliveryOption[] = [
  { label: "Data from the previous week", value: { dataRangeDays: 7 } },
  { label: "Data from the previous month", value: { dataRangeDays: 30 } },
  { label: "Data from the previous 2 months", value: { dataRangeDays: 60 } },
  { label: "Data from the previous quarter", value: { dataRangeDays: 90 } },
  { label: "Data from the previous 2 quarters", value: { dataRangeDays: 180 } },
  { label: "Data from the previous year", value: { dataRangeDays: 365 } },
];

export function getDeliveryOptions(
  frequency: "weekly" | "monthly" | "quarterly"
): DeliveryOption[] {
  switch (frequency) {
    case "weekly":
      return WEEKLY_OPTIONS;
    case "monthly":
      return MONTHLY_OPTIONS;
    case "quarterly":
      return QUARTERLY_OPTIONS;
  }
}
```

## 4.2 Update ScheduleModal State

**File:** `src/components/modals/ScheduleModal/useScheduleModalState.ts`

```typescript
import { useState } from "react";
import type { SchedulePattern } from "@/lib/questions";
import { getDeliveryOptions, DATA_RANGE_OPTIONS } from "./scheduleOptions";

export type RecurringFrequency = "weekly" | "monthly" | "quarterly";

export function useScheduleModalState(
  onSave: ((schedule: SchedulePattern) => void) | undefined,
  onClose: () => void
) {
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [deliveryIndex, setDeliveryIndex] = useState<number>(0);
  const [dataRangeIndex, setDataRangeIndex] = useState<number>(1); // Default: previous month

  const deliveryOptions = getDeliveryOptions(frequency);
  const selectedDelivery = deliveryOptions[deliveryIndex];
  const selectedDataRange = DATA_RANGE_OPTIONS[dataRangeIndex];

  // Build the schedule pattern from selections
  const buildSchedule = (): SchedulePattern =>
    ({
      frequency,
      ...selectedDelivery.value,
      ...selectedDataRange.value,
    }) as SchedulePattern;

  const handleSave = () => {
    onSave?.(buildSchedule());
    onClose();
  };

  // Reset delivery index when frequency changes
  const handleFrequencyChange = (newFrequency: RecurringFrequency) => {
    setFrequency(newFrequency);
    setDeliveryIndex(0);
  };

  return {
    frequency,
    setFrequency: handleFrequencyChange,
    deliveryIndex,
    setDeliveryIndex,
    dataRangeIndex,
    setDataRangeIndex,
    deliveryOptions,
    selectedDelivery,
    selectedDataRange,
    buildSchedule,
    handleSave,
  };
}
```

## 4.3 Rebuild ScheduleModal UI

**File:** `src/components/modals/ScheduleModal/ScheduleModal.tsx`

Replace calendar pickers with dropdowns. Show computed first delivery date.

### Phase 4 Checklist

- [ ] Create `scheduleOptions.ts` with all dropdown data
- [ ] Update `useScheduleModalState.ts` for new state structure
- [ ] Rebuild `ScheduleModal.tsx` with dropdowns
- [ ] Add helper text showing first delivery date
- [ ] Remove old calendar dependencies
- [ ] Test all frequency/delivery combinations

---

# Phase 5: Frontend - QuestionModal & Cards

**Goal:** Update QuestionModal to use new schema, update cards to use displayContent.

## 5.1 Update QuestionModal

**File:** `src/components/modals/QuestionModal/QuestionModal.tsx`

Changes:

- Remove `tags` from submission
- Remove `questionType` from submission
- ScheduleModal now returns full `SchedulePattern` instead of just frequency
- Pass `schedule` directly to mutation (no processing)

## 5.2 Update QuestionCards

**Files:**

- `AnsweredQuestionCard.tsx`
- `InProgressQuestionCard.tsx`
- `RecurringQuestionCard.tsx`

Change: `question.content` → `question.displayContent`

## 5.3 Update Answer Detail Page

**File:** `src/app/dashboard/questions/[id]/Answer.tsx`

```typescript
// First card uses displayContent
{question && (
  <AnswerCard
    topLabel="You asked"
    content={question.displayContent}
    // ...
  />
)}

// Answer iteration: derive topLabel from sender
{answers.map((answer) => (
  <AnswerCard
    topLabel={answer.sender === "user" ? "You asked" : "Overbase answered"}
    content={answer.content}
    tableData={answer.tableData}
    // ...
  />
))}
```

### Phase 5 Checklist

- [ ] Update QuestionModal to remove tags, questionType
- [ ] Update QuestionModal to pass schedule directly
- [ ] Update all QuestionCards to use `displayContent`
- [ ] Update Answer page to derive topLabel from sender
- [ ] Test question creation flow
- [ ] Test question display

---

# Phase 6: Frontend - Sidebar Filters

**Goal:** Replace tag-based navigation with computed filters.

## 6.1 Update Sidebar/Navigation

Changes:

- Remove tag-based filtering
- Add filter options:
  - "All questions"
  - "Asked this week"
  - "Asked this month"
  - "Recurring questions"
- Each filter uses the appropriate query

### Phase 6 Checklist

- [ ] Remove tag filter UI
- [ ] Add new filter options
- [ ] Wire up filter queries
- [ ] Test all filters work correctly

---

# Phase 7: Cleanup

**Goal:** Remove dead code and unused dependencies.

## 7.1 Files/Code to Delete

- `BASE_QUESTION_TAGS` constant (if only used for tags)
- `getUniqueTags` query references
- `questionType` references throughout codebase
- `status` field write operations (now derived)
- Old calendar imports in ScheduleModal
- Any `topLabel` string literals

## 7.2 Update Types to Remove Old Fields

Clean up type definitions that reference removed fields.

### Phase 7 Checklist

- [ ] Delete unused constants
- [ ] Remove unused query imports
- [ ] Clean up old type references
- [ ] Run TypeScript to check for errors
- [ ] Run linter to check for issues

---

# Summary: Execution Order

| Phase | Description                 | Risk     | Dependencies |
| ----- | --------------------------- | -------- | ------------ |
| **1** | Types & Utilities           | Low      | None         |
| **2** | Schema Migration            | **High** | Phase 1      |
| **3** | Backend (Queries/Mutations) | Medium   | Phase 2      |
| **4** | ScheduleModal Rebuild       | Medium   | Phase 1      |
| **5** | QuestionModal & Cards       | Low      | Phase 3      |
| **6** | Sidebar Filters             | Low      | Phase 3      |
| **7** | Cleanup                     | Low      | All phases   |

---

# Testing Checklist (After All Phases)

- [ ] Create one-time question → appears correctly
- [ ] Create recurring question (weekly) → shows pill, correct schedule
- [ ] Create recurring question (monthly) → shows pill, correct schedule
- [ ] Create recurring question (quarterly) → shows pill, correct schedule
- [ ] Question with Overbase response → shows tableData from LAST response
- [ ] Multi-turn conversation → all messages display correctly
- [ ] Cancel question (single answer only) → removed from list
- [ ] Privacy toggle → works on thread and answers
- [ ] Filter: All questions → shows all
- [ ] Filter: Asked this week → shows recent only
- [ ] Filter: Asked this month → shows month's questions
- [ ] Filter: Recurring → shows only recurring
- [ ] Attachments display correctly
