# Rules

> Governs which of hadolint's rules its configuration turns off.

## General

### hadolint-rule-ignored-only-against-an-active-rule → own-settings-only-add · MUST

Every hadolint rule the configuration ignores asks for what an active rule forbids. DL3010 is one: it asks for `ADD`, which `files-copied-never-added` forbids.

| Why |
|---|
| a rule ignored in the configuration is silenced for every Dockerfile, so one ignored for any other reason hides each of its findings in files nobody looked at. |

### hadolint-ignore-names-the-rule-it-gives-way-to · MUST

Every hadolint rule the configuration ignores names the active rule it gives way to. It names it by the key of the preset setting that holds it, or in a comment above it.

| Why |
|---|
| an ignore whose reason is not written cannot be judged once the rule it gives way to is lowered or changed, so it goes on hiding findings that nothing forbids any more. |
