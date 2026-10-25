# Observability

> Governs the span of a model call.

## Spans

### model-call-span-carries-model-tokens-and-stop → unit-of-work-opens-a-span · SHOULD

Every model call is a span carrying the model requested and the model that answered, the tokens in, cached and out, and the reason the output stopped, named as the version of OpenTelemetry's GenAI conventions the project pins names them.

| Why |
|---|
| cost, latency and a change of behaviour are traced to a model and a prompt only through these fields, and conventions still in development rename them between versions. |
