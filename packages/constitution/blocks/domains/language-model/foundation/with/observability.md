# Observability

> Governs the span of a language-model call.

## Spans

### model-call-span-carries-model-tokens-and-stop → unit-of-work-opens-a-span · SHOULD

Every language-model call is a span that carries its model, its tokens and its stop. The span carries the model requested and the model that answered, the tokens in, cached and out, and the reason the output stopped, named as the version of OpenTelemetry's GenAI conventions the project pins names them.

| Why |
|---|
| without these fields cost, latency and a change of behaviour cannot be traced to a language model and a prompt, and names taken from no pinned version change under every query when conventions still in development rename them — OpenTelemetry's GenAI conventions. |
