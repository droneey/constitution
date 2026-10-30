# Models

> Governs the model a program calls, and what stands in for it in a spec.

## General

### model-pinned-to-a-snapshot · MUST

A model the program calls — a fallback included — is named in its code by an identifier that pins one snapshot, never by an alias that moves, such as `-latest`, nor by a preview or experimental model in production; the model and the settings that shape its output change only with a release.

| Why |
|---|
| a provider moves an alias and retires a preview at short notice, so the program's answers change with no change of its own, and a model set from the environment changes outside every check. |

### pinned-model-retirement-tracked · SHOULD

Each pinned model has the retirement date its provider announced recorded beside its pin, and its replacement passes the task's eval and ships before that date.

| Why |
|---|
| a provider retires a snapshot on a date it announces, and after it every call to the pin fails, so a pin nobody watches turns stability into an outage. |

## In specs

### spec-replaces-the-model → test-runs-in-a-sandbox · MUST

A spec replaces the model with scripted or recorded answers.

| Why |
|---|
| a real model is slow, paid for and answers differently on each run, while a spec must give the same answer every run. |
