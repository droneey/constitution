# Access control with a user interface

> Governs sign-in and sessions on a screen.

## Sign-in

### sign-in-needs-no-cognitive-test · MUST
A step of signing in asks no cognitive test — remembering a password, transcribing a code, solving a puzzle — unless another way past it exists, or the platform can fill or paste the answer.

| Why | Tags |
|---|---|
| a test of memory or reasoning shuts out people with cognitive disabilities, while the answer is often already on their device. | [a11y, security] |

## Sessions

### session-limits-warned-before-they-end → time-limit-warned-and-extendable · MUST
A session's idle limit and its absolute limit warn the person before they end, and the idle one lets them extend it; an absolute limit shorter than twenty hours is one a standard the product must follow sets — such as the re-authentication NIST SP 800-63B-4 asks, which WCAG 2.2.1 counts as essential — and ends in a sign-in that keeps every input the person made.

| Why | Tags |
|---|---|
| a session that ends without warning loses the work on the screen, and an absolute limit is extendable by nobody, so where a standard shortens it, the person's work survives the sign-in. | [a11y, security] |
