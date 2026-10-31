# Clones

> Governs the clones jscpd finds in a unit's code and how one is kept.

## General

### clone-in-source-joined-or-suppressed → copies-joined-when-they-change-together · MUST

A clone of five lines and fifty tokens in a unit's source or build code, its specs, their fixtures and its generated files aside, is joined into one home both places read, or, where its copies only look alike and would change apart, suppressed on the copy written later.

| Why |
|---|
| jscpd cannot tell a fact copied from a shape repeated, so each clone it finds is decided once, by its author, where the next reader sees the decision. |

## Suppressions

### jscpd-suppression-wraps-one-copy → suppression-silences-one-finding · MUST

A clone is suppressed by a comment `jscpd:ignore-start: <reason>` on the line above the copy and a comment `jscpd:ignore-end` on the line below it, around that copy's lines alone.

| Why |
|---|
| jscpd's markers name no clone and silence every one that overlaps the lines between them, so a span wider than the copy hides the next clone made beside it. |
