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
A session's idle limit and its absolute limit warn the person before they end, the idle one can be extended, and the sign-in that ends a session keeps every input.

| Why | Tags |
|---|---|
| a session that ends without warning loses the work on the screen, and an absolute limit is extendable by nobody, so the person's work must survive the sign-in. | [a11y, security] |
