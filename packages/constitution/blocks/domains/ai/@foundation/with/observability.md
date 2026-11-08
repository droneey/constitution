# Observability

> Governs the span of a language-model call.

## Spans

### model-call-span-carries-its-usage → work-item-opens-a-span · SHOULD

Every language-model call's span carries its usage: the model requested and the model that answered, the model tokens in, cached and out, and why its output stopped.

#### Why

Without these fields cost, latency and a change of behaviour cannot be traced to a language model and a prompt.

#### Examples

```pseudo title="Avoid"
let request = triageTicketRequest(ticket)
let span = tracer.startSpan("chat " + request.model)
let result = model.generate(request)

call span.setAttributes({
  "gen_ai.request.model": request.model,
  "gen_ai.response.model": result.model,
})
call span.end()
```

```pseudo title="Prefer"
let request = triageTicketRequest(ticket)
let span = tracer.startSpan("chat " + request.model)
let result = model.generate(request)

call span.setAttributes({
  "gen_ai.request.model": request.model,
  "gen_ai.response.model": result.model,
  "gen_ai.usage.input_tokens": result.usage.inputTokens,
  "gen_ai.usage.cache_read.input_tokens": result.usage.cachedTokens,
  "gen_ai.usage.output_tokens": result.usage.outputTokens,
  "gen_ai.response.finish_reasons": [result.stopReason],
})
call span.end()
```

### model-call-span-named-by-a-pinned-convention · MUST

Every field of a language-model call's span takes the name the version of OpenTelemetry's GenAI conventions the project pins gives it.

#### Why

Conventions still in development rename their fields, so names taken from no pinned version change under every query — OpenTelemetry's GenAI conventions.

#### Examples

```pseudo title="Avoid"
call span.setAttributes({
  "llm.model": request.model,
  "llm.prompt_tokens": result.usage.inputTokens,
  "llm.completion_tokens": result.usage.outputTokens,
})
```

```pseudo title="Prefer"
let genAi = semanticConventions("gen_ai", { version: "1.40.0" })

call span.setAttributes({
  [genAi.requestModel]: request.model,
  [genAi.usageInputTokens]: result.usage.inputTokens,
  [genAi.usageOutputTokens]: result.usage.outputTokens,
})
```
