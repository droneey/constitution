# Messages

> Governs a message: its macros, its catalogue and where it is defined.

## General

### messages-through-lingui-macros → messages-take-named-parameters · MUST

A message is an ICU message inside Lingui's `msg` macro, with named placeholders. Each of its values is interpolated in the macro's template by a variable's name, or labelled by `ph()`, so it becomes a named placeholder, never a positional one.

| Why |
|---|
| a message built outside the macro never reaches the catalogue whole, and a positional placeholder tells the translator nothing of the value it holds, so the sentence is translated in pieces and its values stay where the source language put them — ICU MessageFormat. |

### shown-text-rendered-from-its-descriptor → user-facing-text-from-the-catalogue · MUST

Shown text is rendered from its descriptor. A message in its `.messages` file is a `msg` descriptor, looked up by its source message, and the code that shows the text hands that descriptor to Lingui to render — never a `t` or a `<Trans>` with its text inline, a bare literal, or an id built by hand.

| Why |
|---|
| a macro written inline puts the text outside its `.messages` file, a bare literal never reaches the catalogue since extraction finds a message only in a macro, and an id built by hand matches no message it extracts. |

### macros-expanded-by-the-lingui-transform · MUST

Every run that loads code with Lingui's macros — the build and the specs — expands them first with Lingui's own transform.

| Why |
|---|
| a macro is no function at run time, so code that reaches a run unexpanded throws there, and a transform borrowed from another tool can stop expanding it without a warning. |

### source-catalogue-current-in-the-check → missing-message-key-fails-the-check · MUST

The committed source catalogue is current, or the check fails. The check extracts the source locale's catalogue and fails when it differs from the one committed.

| Why |
|---|
| a message missing from the committed catalogue reaches a user's screen untranslated. |
