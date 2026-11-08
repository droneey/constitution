# Contract

> Governs what the API offers, how it changes, and what it accepts.

## General

### contract-published-machine-readable → shared-format-declared-in-a-schema · MUST

Every API publishes its contract as a document a machine reads. The document declares each of its operations with its parameters, its answers and, where its style declares them, its failures.

| Why |
|---|
| an operation, a parameter or a failure the contract leaves out is one no generated client offers and no spec checks, so a caller learns of it only by calling it in production. |

## Shapes

### request-binds-only-declared-fields · MUST

Every request sets only the fields its operation's declared shape lets a caller set, never a field the program decides. Such fields include an owner, a role, a status and an identifier. Exempt: the identifier a caller makes for what it creates, checked for its form.

| Why |
|---|
| a caller who adds a field the program decides to a body otherwise sets it, granting itself a role or taking over another's record. |

### upload-accepted-by-its-content · MUST

Every uploaded file is accepted only when its content shows a kind its operation allows, and its extension one it allows too. Its declared type decides nothing, and its name decides nothing alone.

| Why |
|---|
| a caller gives a script an image's name and declared type, and a check that trusts either stores and serves the script as an image, while a file made to show an allowed kind in its content is still served by the kind its extension names — OWASP File Upload Cheat Sheet. |

### field-names-in-one-case · SHOULD

All fields of every shape the API exchanges are named in one case across the whole API. Exempt: a field whose name a standard or a protocol fixes, such as a member of a problem document.

| Why |
|---|
| fields named in two cases make a caller guess each field's spelling and fail on a wrong guess, and a generated client mixes two conventions in one type. |

## Effects

### write-takes-an-idempotency-key → operation-idempotent-by-design · MUST

Every write a repeat would perform twice takes an idempotency key. For a creation the key is the identifier the caller makes for what it creates, which the record keeps as long as it lives; for any other write, such as a payment captured or a message sent, it is a key the server keeps.

| Why |
|---|
| a caller retries a write whose answer it lost, and without the key the retry creates a second order or a second charge. |

### idempotency-key-bound-to-its-caller → receiver-gives-a-repeat-the-first-effect · MUST

Every idempotency key the server keeps is bound to the caller that sent it. A repeat from another caller never gets its stored answer.

| Why |
|---|
| a key shared across callers hands one caller's stored answer, with whatever it holds, to another who guessed or reused the key. |

### idempotency-key-lifetime-declared-in-the-contract → receiver-gives-a-repeat-the-first-effect · MUST

Every idempotency key the server keeps lives for a time the contract declares.

| Why |
|---|
| a caller that does not know how long a key is kept cannot tell how long a retry stays safe, and a retry after the key was forgotten performs the write again. |

### idempotency-key-reused-with-other-input-refused → receiver-gives-a-repeat-the-first-effect · MUST

Every request that carries an idempotency key already seen with other input is refused as a reused key. It is never run and never given the first answer. Exempt: a creation's own identifier sent to an operation that also replaces what it names, which the other input replaces.

| Why |
|---|
| a key reused with another body is its caller's bug, and the first answer given to it tells that caller its new write took effect when nothing was done. |

## Change

### published-contract-changed-only-by-addition → format-changed-in-steps · MUST

Every published contract changes in place only by addition: a new operation, a new optional field of a request or a new field of an answer. A removal or a change of meaning ships beside the old form, as a new version or, in a style that has no versions, under a new name. Exempt: the removal of what was retired and announced.

| Why |
|---|
| a caller the program does not deploy breaks the day a field it reads disappears or changes meaning — the expand–contract pattern. |

### contract-change-checked-against-the-last-release → format-change-checked-against-its-last-release · MUST

Every published contract's check against its last release passes a removal only of what was retired and is past its announced date.

| Why |
|---|
| the program cannot count the callers it does not deploy, so a removal judged by who still seems to call breaks a caller nobody saw, while the announced date is the one promise every caller was given. |

### retired-operation-announced-before-removal · MUST

Every operation or field a published contract retires is announced, with its removal date, before it is removed.

| Why |
|---|
| a caller learns of a removal from the answers it already reads, in time to move, rather than from the failure on the day it happens. |

### retired-part-removed-no-earlier-than-its-date · MUST

Every operation or field a published contract retires is removed no earlier than the date announced for it.

| Why |
|---|
| a caller that scheduled its move by the announced date breaks on an earlier removal as if none had been announced. |

### oldest-supported-client-release-served · SHOULD

Every server tells the programs of its project that call it, whose release a user holds, the oldest release it supports. It tells them in an answer or in a field of its contract. Such programs include an installed app and a tab left open across releases.

| Why |
|---|
| a program that cannot learn the floor keeps calling with a release the server no longer reads, and its user meets failures instead of the prompt to update. |
