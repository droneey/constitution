# People

> Governs the personal data in the text a language model reads and writes, and in the eval cases drawn from it.

## Telemetry

### prompt-text-in-telemetry-masked → personal-data-kept-out-of-output · MUST

All text of prompts and outputs that reaches logs, traces or metrics is masked of personal data.

| Why |
|---|
| a setting turned on to debug one call sends every person's typed text and documents into telemetry, where more people read it for longer. |

## Eval cases

### eval-case-cleared-of-personal-data → personal-data-kept-out-of-output · MUST

Every eval case drawn from real use or a production sample is cleared of personal data before it is kept.

| Why |
|---|
| a case copied from a person's real input carries their data into the eval and every copy of it, where everyone who runs the eval reads it and no request to erase it reaches. |
