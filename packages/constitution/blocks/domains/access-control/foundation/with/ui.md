# User interface

> Governs sign-in and sessions on a screen.

## Sign-in

### sign-in-needs-no-cognitive-test · MUST

Sign-in asks no cognitive test. A step of signing in asks none — remembering a password, transcribing a code, solving a puzzle — unless another way past it exists, or the platform can fill or paste the answer.

| Why |
|---|
| a test of memory or reasoning shuts out people with cognitive disabilities, while the answer is often already on their device — WCAG 2.2, Accessible Authentication (Minimum). |

## Sessions

### session-limits-warned-before-they-end → time-limit-warned-and-extendable · MUST

A session's limits warn the person before they end, and an absolute one is short only where a standard sets it. Both the idle and the absolute limit warn, and the idle one lets the person extend it. An absolute limit is shorter than twenty hours only where a standard the product must follow sets it — such as the re-authentication NIST SP 800-63B-4 asks, claimed under WCAG 2.2.1's essential exception, with that standard named in the accessibility statement — and then ends in a sign-in that keeps every input the person made.

| Why |
|---|
| a session that ends without warning loses the work on the screen, and an absolute limit nobody can extend, set short by a standard, loses that work too unless the sign-in keeps it — WCAG 2.2, Timing Adjustable. |
