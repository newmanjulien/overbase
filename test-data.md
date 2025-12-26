# Convex Dashboard Test Data

Use these JSON payloads in the Convex dashboard to create test data.

> **NOTE:** In the new architecture, `questions` only stores metadata. The actual question content lives in the first `answer` with `sender: "user"`.

---

## TABLE: `questions`

### Question 1: One-Time (will become in-progress)

```json
{
  "privacy": "private"
}
```

### Question 2: One-Time (will become answered)

```json
{
  "privacy": "team"
}
```

### Question 3: Recurring - Weekly on Mondays

```json
{
  "privacy": "team",
  "schedule": {
    "frequency": "weekly",
    "dayOfWeek": 1,
    "dataRangeDays": 7
  }
}
```

### Question 4: Recurring - Monthly on the 1st

```json
{
  "privacy": "private",
  "schedule": {
    "frequency": "monthly",
    "dayOfMonth": 1,
    "dataRangeDays": 30
  }
}
```

### Question 5: Recurring - Quarterly

```json
{
  "privacy": "team",
  "schedule": {
    "frequency": "quarterly",
    "quarterDay": "first",
    "dataRangeDays": 90
  }
}
```

### Question 6: One-Time (long thread)

```json
{
  "privacy": "private"
}
```

---

## TABLE: `answers`

> ⚠️ **IMPORTANT**: Replace `QUESTION_X_ID` with the actual `_id` values from the questions you just created!

### Answer for Question 1 (User's question - makes it in-progress)

```json
{
  "questionThreadId": "QUESTION_1_ID",
  "sender": "user",
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Nullam euismod, nisl eget aliquam ultricies.",
  "privacy": "private"
}
```

### Answer for Question 2 (User's question)

```json
{
  "questionThreadId": "QUESTION_2_ID",
  "sender": "user",
  "content": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "privacy": "team"
}
```

### Answer for Question 2 (Overbase response with table - makes it answered)

```json
{
  "questionThreadId": "QUESTION_2_ID",
  "sender": "overbase",
  "content": "Here's the analysis you requested with the key revenue metrics.",
  "privacy": "team",
  "tableData": [
    {
      "column1": "Acme Corporation",
      "column2": "$2,450,000",
      "column3": "Q4 2024",
      "column4": "Enterprise",
      "column5": "+18.3%"
    },
    {
      "column1": "TechStart Inc",
      "column2": "$850,000",
      "column3": "Q4 2024",
      "column4": "Mid-Market",
      "column5": "+7.2%"
    },
    {
      "column1": "Global Systems Ltd",
      "column2": "$3,100,000",
      "column3": "Q4 2024",
      "column4": "Enterprise",
      "column5": "+23.1%"
    }
  ]
}
```

### Answer for Question 3 (Recurring - user's question)

```json
{
  "questionThreadId": "QUESTION_3_ID",
  "sender": "user",
  "content": "Please provide the Weekly Sales Pipeline summary broken down by geographical region (NA, EMEA, APAC).",
  "privacy": "team"
}
```

### Answer for Question 4 (Recurring - user's question)

```json
{
  "questionThreadId": "QUESTION_4_ID",
  "sender": "user",
  "content": "Curabitur blandit mollis lacus. Fusce convallis metus id felis luctus adipiscing. Monthly performance report needed.",
  "privacy": "private"
}
```

### Answer for Question 5 (Recurring - user's question)

```json
{
  "questionThreadId": "QUESTION_5_ID",
  "sender": "user",
  "content": "Donec pede justo, fringilla vel, aliquet nec. Quarterly board report needed.",
  "privacy": "team"
}
```

### Answers for Question 6 (Long Back-and-Forth Thread)

#### Thread Answer 1: User's question

```json
{
  "questionThreadId": "QUESTION_6_ID",
  "sender": "user",
  "content": "Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero. I need a deep dive into our customer data.",
  "privacy": "private"
}
```

#### Thread Answer 2: Overbase responds with table

```json
{
  "questionThreadId": "QUESTION_6_ID",
  "sender": "overbase",
  "content": "Based on my analysis of your customer data, I found several key insights. Here's the breakdown.",
  "privacy": "private",
  "tableData": [
    {
      "column1": "Enterprise Plus",
      "column2": "147 accounts",
      "column3": "$12.4M ARR",
      "column4": "8.2% churn",
      "column5": "+$2.1M QoQ"
    },
    {
      "column1": "Enterprise",
      "column2": "423 accounts",
      "column3": "$8.7M ARR",
      "column4": "11.5% churn",
      "column5": "+$890K QoQ"
    }
  ]
}
```

#### Thread Answer 3: User follow-up

```json
{
  "questionThreadId": "QUESTION_6_ID",
  "sender": "user",
  "content": "Can you break down the enterprise churn by region? I'm particularly interested in EMEA.",
  "privacy": "private"
}
```

#### Thread Answer 4: Overbase responds

```json
{
  "questionThreadId": "QUESTION_6_ID",
  "sender": "overbase",
  "content": "Great question. Looking at the regional breakdown, EMEA is showing elevated churn rates.",
  "privacy": "private",
  "tableData": [
    {
      "column1": "North America",
      "column2": "298 accounts",
      "column3": "$6.8M ARR",
      "column4": "7.1% churn",
      "column5": "Stable"
    },
    {
      "column1": "EMEA",
      "column2": "189 accounts",
      "column3": "$4.2M ARR",
      "column4": "16.8% churn",
      "column5": "At Risk"
    }
  ]
}
```

---

## Quick Reference: What Each Tests

| Record                 | Tests                                               |
| ---------------------- | --------------------------------------------------- |
| Question 1 + 1 answer  | In-progress card (user asked, no Overbase response) |
| Question 2 + 2 answers | Answered card with table preview                    |
| Question 3 + 1 answer  | Recurring weekly (red pill)                         |
| Question 4 + 1 answer  | Recurring monthly                                   |
| Question 5 + 1 answer  | Recurring quarterly                                 |
| Question 6 + 4 answers | Long thread detail page                             |

---

## Paste Order

1. Create all 6 questions first
2. Copy each question's `_id` and use it in the corresponding answers
3. Create answers in order (they appear chronologically by creation time)
