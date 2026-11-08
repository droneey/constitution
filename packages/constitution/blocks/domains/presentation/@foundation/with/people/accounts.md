# Accounts

> Governs the steps of signing in a screen asks, and how a screen warns of a session's end and keeps its input past it.

## Sign-in

### sign-in-needs-no-cognitive-test · MUST

No step of signing in asks a cognitive test, such as remembering a password, transcribing a code or solving a puzzle. Exempt: a step that offers another way past it, or whose answer the platform can fill or paste.

| Why |
|---|
| a test of memory or reasoning shuts out people with cognitive disabilities, while the answer is often already on their device — WCAG 2.2, Accessible Authentication (Minimum). |

## Sessions

### session-limits-warned-before-they-end · MUST

Every session limit, the absolute one included, warns its person before it ends.

| Why |
|---|
| a session that ends without warning loses the work on the screen — WCAG 2.2, Timing Adjustable. |

### short-session-ends-in-a-sign-in-that-keeps-the-input · MUST

Every absolute session limit of twenty hours or less ends in a sign-in that keeps every input the person made.

| Why |
|---|
| an absolute limit nobody can extend, set short by a standard, loses the work on the screen unless the sign-in keeps it — WCAG 2.2, Timing Adjustable. |
