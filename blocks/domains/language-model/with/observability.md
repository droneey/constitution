# Language model with observability

> Governs what a model call leaves in logs, traces and metrics.

## Content

### prompt-text-kept-out-of-telemetry → secret-and-personal-data-kept-out-of-output · MUST
The text of prompts and outputs reaches logs, traces and metrics only through a setting that is off by default, and is masked of personal data when the setting is on.

| Why | Tags |
|---|---|
| prompts carry what people typed and the documents they hold, and telemetry keeps that text longer and shows it to more people. | [security, data] |

## Spans

### model-call-span-carries-model-tokens-and-stop → unit-of-work-opens-a-span · SHOULD
Every model call is a span carrying the model requested and the model that answered, the tokens in, cached and out, and the reason the output stopped, named as OpenTelemetry's GenAI conventions name them.

| Why | Tags |
|---|---|
| cost, latency and a change of behaviour are traced to a model and a prompt only through these fields. | [performance] |
