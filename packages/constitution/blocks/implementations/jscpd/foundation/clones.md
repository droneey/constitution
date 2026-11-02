# Clones

> Governs the clones jscpd finds in a unit's code and how one is kept.

## General

### clone-in-source-joined-or-suppressed → copies-joined-when-they-change-together · MUST

A clone jscpd reports in a unit's code is joined where its copies must be one, and otherwise suppressed with its reason. jscpd reports a clone of five lines and fifty tokens from its second copy, in source or build code, leaving out its specs, their fixtures and its generated files. A clone the rule it tightens would join is joined into one home that each of its places reads; any other clone is suppressed on the copy written later, its reason saying that the copies only look alike.

| Why |
|---|
| jscpd reports from the second copy and cannot tell a fact copied from a shape repeated, so a clone joined as soon as it is reported guesses an axis two copies cannot show, and one left undecided is either a fact that drifts between its copies or a finding everyone learns to skip; a suppression with its reason shows the next reader the decision — the rule of three, and DRY. |

## Suppressions

### jscpd-suppression-wraps-one-copy → suppression-silences-one-finding · MUST

A jscpd suppression wraps one copy's lines alone. It is a comment `jscpd:ignore-start: <reason>` on the line above the copy and a comment `jscpd:ignore-end` on the line below it.

| Why |
|---|
| jscpd's markers name no clone and silence every one that overlaps the lines between them, so a span wider than the copy hides the next clone made beside it. |
