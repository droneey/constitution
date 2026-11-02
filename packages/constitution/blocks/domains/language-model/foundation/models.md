# Models

> Governs the language model a program calls: its snapshot and its retirement.

## General

### model-pinned-to-a-snapshot · MUST

A language model, a fallback included, is pinned to a snapshot. The program names each language model it calls in its code by the identifier of one snapshot, never by an alias that moves, such as `-latest`, nor by a preview or experimental model in production, and the model and the settings that shape its output change only with a release.

| Why |
|---|
| a provider moves an alias and retires a preview at short notice, so the program's answers change with no change of its own, and a language model set from the environment changes outside every check. |

### pinned-model-retirement-tracked · SHOULD

A pinned language model's retirement is tracked. The retirement date its provider announced is recorded beside its pin, and its replacement passes the task's eval and ships before that date.

| Why |
|---|
| a provider retires a snapshot on a date it announces, and after it every call to the pin fails, so a pin nobody watches turns stability into an outage. |
