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
A session's idle limit warns the person before it ends and lets them extend it, and its absolute limit is at least twenty hours unless a shorter one is essential to the activity, as WCAG 2.2.1 allows.

| Why | Tags |
|---|---|
| a session that ends without warning loses the work on the screen, and an absolute limit is extendable by nobody. | [a11y, security] |
