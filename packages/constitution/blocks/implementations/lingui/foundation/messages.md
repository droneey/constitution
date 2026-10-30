# Messages

> Governs a message: its macros, its catalog and where it is defined.

## General

### messages-through-lingui-macros → messages-take-named-parameters · MUST

A message is written as an ICU message inside Lingui's `msg` macro, each of its values interpolated in the macro's template by a variable's name, or labelled by `ph()`, so it becomes a named placeholder, never a positional one.

| Why |
|---|
| the macro extracts the message into the catalog with its placeholders and plural forms intact, so a translator sees the whole sentence and places each value where the language puts it. |

### shown-text-rendered-from-its-descriptor → user-facing-text-from-catalog · MUST

A message in its `.messages` file is a `msg` descriptor, and the code that shows the text hands that descriptor to Lingui to render, never a `t` or a `<Trans>` with its text inline, a bare literal, or an id built by hand.

| Why |
|---|
| a macro written inline puts the text outside its `.messages` file, a bare literal never reaches the catalog since extraction finds a message only in a macro, and an id built by hand matches no message it extracts. |

### macros-expanded-by-the-lingui-transform · MUST

Every run that loads code with Lingui's macros — the build and the specs — expands them first with Lingui's own transform.

| Why |
|---|
| a macro is no function at run time, so code that reaches a run unexpanded throws there, and a transform borrowed from another tool can stop expanding it without a warning. |

### source-catalog-current-in-the-check → i18n-missing-key-fails-the-check · MUST

The check extracts the source locale's catalog and fails when it differs from the one committed.

| Why |
|---|
| a message missing from the committed catalog then fails before release, not on a user's screen. |
