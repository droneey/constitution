# People

> Governs the personal data a telemetry signal's mask removes.

## Masking

### telemetry-mask-lists-personal-fields → personal-data-kept-out-of-output · MUST

Every telemetry signal's mask also looks for the names of the personal fields the project keeps. Such names include email and phone, compared as whole words as the secret words are.

#### Why

A person's data passed as a field by mistake otherwise reaches every log record, span and exemplar the mask covers for secrets, and leaves with them for whoever reads the telemetry signals.

#### Examples

```pseudo title="Avoid"
# root/telemetry
let pipeline = telemetryPipeline({ mask: createMask(secretWords) })
```

```pseudo title="Prefer"
# root/telemetry
let pipeline = telemetryPipeline({
  mask: createMask([...secretWords, "email", "phone", "address", "birth date"])
})
```
