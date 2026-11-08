# Duplicates

> Governs the duplicates jscpd finds in a unit's code and how one is kept.

## General

### clone-in-source-joined-or-suppressed → copies-joined-when-they-change-together · MUST

Every duplicate jscpd reports in a unit's code is joined, or suppressed with its reason. jscpd reports a duplicate of five lines and fifty tokens from its second copy, in source or build code, leaving out its test code and its generated files. A duplicate the rule it tightens would join is joined into one home that each of its places reads; any other is suppressed on the copy written later, its reason saying that the copies only look alike.

| Why |
|---|
| jscpd reports from the second copy and cannot tell a fact copied from a shape repeated, so a duplicate joined as soon as it is reported guesses an axis two copies cannot show, and one left undecided is either a fact that drifts between its copies or a finding everyone learns to skip; a suppression with its reason shows the next reader the decision — the rule of three, and DRY. |

## Suppressions

### jscpd-suppression-wraps-one-copy → suppression-silences-one-finding · MUST

Every jscpd suppression wraps one copy's lines alone. It is a comment `jscpd:ignore-start` on the line above the copy and a comment `jscpd:ignore-end` on the line below it.

| Why |
|---|
| jscpd's markers name no duplicate and silence every one that overlaps the lines between them, so a span wider than the copy hides the next duplicate made beside it. |

### jscpd-suppression-gives-its-reason-after-the-colon → suppression-states-its-reason · MUST

Every jscpd suppression states its reason after a colon on its opening marker, as `jscpd:ignore-start: <reason>`.

| Why |
|---|
| a reason on the marker's own line stays with the span it opens, where a reviewer judges the exception, and jscpd reads the marker with its reason as it reads the bare one. |
