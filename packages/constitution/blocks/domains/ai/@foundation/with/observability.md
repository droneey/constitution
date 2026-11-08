# Observability

> Governs the span of a language-model call.

## Spans

### model-call-span-carries-its-usage → work-item-opens-a-span · SHOULD

Every language-model call's span carries its usage: the model requested and the model that answered, the model tokens in, cached and out, and why its output stopped.

| Why |
|---|
| without these fields cost, latency and a change of behaviour cannot be traced to a language model and a prompt. |

### model-call-span-named-by-a-pinned-convention · MUST

Every field of a language-model call's span takes the name the version of OpenTelemetry's GenAI conventions the project pins gives it.

| Why |
|---|
| conventions still in development rename their fields, so names taken from no pinned version change under every query — OpenTelemetry's GenAI conventions. |
