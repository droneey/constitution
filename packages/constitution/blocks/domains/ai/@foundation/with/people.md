# People

> Governs the personal data in the text a language model reads and writes, and in the eval cases drawn from it.

## Telemetry

### prompt-text-in-telemetry-masked → personal-data-kept-out-of-output · MUST

All text of prompts and outputs that reaches logs, traces or metrics is masked of personal data.

#### Why

A setting turned on to debug one call sends every person's typed text and documents into telemetry, where more people read it for longer.

#### Examples

```pseudo title="Avoid"
if telemetrySettings.recordModelText then
  log.debug("triage text", {
    prompt: prompt.messages,
    output: result.text,
  })
```

```pseudo title="Prefer"
if telemetrySettings.recordModelText then
  log.debug("triage text", {
    prompt: maskPersonalData(prompt.messages),
    output: maskPersonalData(result.text),
  })
```

## Eval cases

### eval-case-cleared-of-personal-data → personal-data-kept-out-of-output · MUST

Every eval case drawn from real use or a production sample is cleared of personal data before it is kept.

#### Why

A case copied from a person's real input carries their data into the eval and every copy of it, where everyone who runs the eval reads it and no request to erase it reaches.

#### Examples

```text title="Avoid"
case 418   "I'm Olena Kovalenko, card ending 4417,
            order 88213 never reached 12 Lypova St."
           -> shipping
```

```text title="Prefer"
case 418   "I'm [name], card ending [card],
            order [order] never reached [address]."
           -> shipping
```
