# Signals

> Governs what every telemetry signal carries and what it masks, how it is emitted, named and exported, and how it is flushed.

## Vocabulary

A **telemetry signal** is a diagnostic, as core's functions chapter defines one, that the program writes for its operator as a log record, a span or a metric.

The **telemetry pipeline** is the code between a telemetry signal's writer and its output or export, which enriches, masks and renders each telemetry signal.

A **work item** is one request served, job run or message handled, from its start to its outcome.

The **secret words**{#secret-words}, a default, are password, token, api key, private key, authorization, cookie and secret.

## General

### telemetry-carries-the-service-identity · SHOULD

Every telemetry signal carries its service's name, its version and the deployment environment it runs in.

#### Why

Telemetry signals of several services and releases meet in one collector, and one without them cannot be traced to the code that wrote it.

#### Examples

```pseudo title="Avoid"
# root/telemetry
let telemetry = createTelemetry({
  exporter: otlpExporter({ endpoint: config.otlpEndpoint })
})
```

```pseudo title="Prefer"
# root/telemetry
let telemetry = createTelemetry({
  exporter: otlpExporter({ endpoint: config.otlpEndpoint }),
  resource: {
    "service.name": "shop",
    "service.version": build.version,
    "deployment.environment.name": config.environmentName
  }
})
```

### telemetry-emitted-through-a-vendor-neutral-api · SHOULD

Every span and metric is emitted through one vendor-neutral API, never a backend's own.

#### Why

Telemetry signals emitted through a vendor's own API tie every instrumented line to that vendor, so a change of backend is a change of code, and the libraries that instrument themselves through the neutral API go unseen.

#### Examples

```pseudo title="Avoid"
# libs/trace-middleware/trace-work-item
import { apm } from "acme-apm-agent"

let transaction = apm.startTransaction(operation)
```

```pseudo title="Prefer"
# libs/trace-middleware/trace-work-item
import { tracer } from "telemetry-api"

let span = tracer.startSpan(operation)
```

### telemetry-exported-over-otlp · SHOULD

Every telemetry signal reaches its backend over OTLP, or a log record through a collector that reads the program's structured log. Exempt: a metric served at an OpenMetrics endpoint that a collector reads.

#### Why

A telemetry signal sent by a vendor's own protocol ties the program's setup to that vendor, so a change of backend is a change of every exporter, while a metric served in the open OpenMetrics format ties it to none — OpenTelemetry, and OpenMetrics.

#### Examples

```pseudo title="Avoid"
# root/telemetry
let telemetry = createTelemetry({
  exporter: acmeApmExporter({ apiKey: config.acmeApiKey })
})
```

```pseudo title="Prefer"
# root/telemetry
let telemetry = createTelemetry({
  exporter: otlpExporter({ endpoint: config.otlpEndpoint })
})
```

### telemetry-named-by-the-semantic-conventions · MUST

Every measure, attribute or resource that a stable semantic convention of OpenTelemetry names takes that name, its unit and its attributes. Such names include that of an HTTP server's request duration and that of the service.

#### Why

A measure named its own way differs between two services of one project, and every backend needs a mapping of its own before it can read it — OpenTelemetry's semantic conventions.

#### Examples

```pseudo title="Avoid"
let requestTime = meter.histogram("request_time_ms")

requestTime.record(elapsedMs, { route: request.route, code: answer.status })
```

```pseudo title="Prefer"
let requestDuration = meter.histogram("http.server.request.duration", { unit: "s" })

requestDuration.record(elapsedSeconds, {
  "http.request.method": request.method,
  "http.route": request.route,
  "http.response.status_code": answer.status
})
```

### telemetry-flushed-before-exit → program-stops-cleanly · MUST

Every program told to stop flushes the telemetry signals it holds in buffers before it exits, within the bound of its stop.

#### Why

The telemetry signals of the last seconds, often the ones that explain the stop, are otherwise lost with the process.

#### Examples

```pseudo title="Avoid"
# root/stop
function stop(server)
  await server.close()
  exitProcess()  # the last seconds' spans and records lost
```

```pseudo title="Prefer"
# root/stop
function stop(server, telemetry)
  await server.close()
  await telemetry.flush({ within: stopBound })
  exitProcess()
```

## Masking

### telemetry-value-masked-by-its-key → secret-kept-out-of-output · MUST

Every value of a telemetry signal whose key holds a secret word is masked before any output or export. That holds for every key at any depth, such as a log record's field, a span's attribute or a metric's exemplar. A key holds a secret word when one of its words, found across its case and separators, equals one of the secret words as a whole word.

#### Why

A secret passed as a field by mistake is masked whichever code wrote it, while a mask of exact keys misses a key that only holds a secret's name among other words, and one of substrings masks the counts of tokens a span must carry.

#### Examples

```pseudo title="Avoid"
# libs/telemetry-mask/mask
function mask(fields, secretWords)
  return mapEntries(fields, function(key, value)
    secretWords.includes(lowerCase(key)) ? masked : value)  # misses "refreshToken" and nested keys
```

```pseudo title="Prefer"
# libs/telemetry-mask/mask
function mask(fields, secretWords)
  return mapEntriesDeep(fields, function(key, value)
    holdsSecretWord(key, secretWords) ? masked : value)

function holdsSecretWord(key, secretWords)
  let words = wordsOf(key)

  return secretWords.some(function(secret) containsRun(words, wordsOf(secret)))
```

### telemetry-address-recorded-without-its-query → secret-kept-out-of-output · MUST

Every address a telemetry signal records is recorded without its query.

#### Why

Instrumentation records the full address by default, and a token or a key in its query then reaches every trace and log that holds it.

#### Examples

```pseudo title="Avoid"
span.setAttribute("url.full", request.url)  # "/reset?token=..." in every trace
```

```pseudo title="Prefer"
span.setAttribute("url.full", withoutQuery(request.url))
```

### telemetry-statement-recorded-with-placeholders → secret-kept-out-of-output · MUST

Every statement to a store that a telemetry signal records holds placeholders for its values, never the values.

#### Why

Instrumentation records a statement's text by default, so a password or a person's data written as a value reaches every trace that holds it.

#### Examples

```pseudo title="Avoid"
span.setAttribute("db.query.text", "select id from customers where email = 'ann@shop.example'")
```

```pseudo title="Prefer"
span.setAttribute("db.query.text", "select id from customers where email = ?")
```
