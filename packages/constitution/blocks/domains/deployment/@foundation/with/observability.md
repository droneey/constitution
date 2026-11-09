# Observability

> Governs what the program logs of its configuration while it is observed.

## General

### refused-configuration-reported → failure-logged-once · MUST

Every changed configuration set the program refuses is logged where it is refused, or reported there to the unit that logs it.

#### Why

A refusal nobody hears of leaves the operator sure the change took, while the program goes on running the set they meant to replace.

#### Examples

```pseudo title="Avoid"
function onConfigChanged(raw, holder)
  let parsed = parseConfig(raw)

  if parsed is Valid then
    holder.swap(parsed.config)  # a refused set is never heard of
```

```pseudo title="Prefer"
function onConfigChanged(raw, holder, logger)
  let parsed = parseConfig(raw)

  when parsed
    is Invalid then logger.warn("configuration refused", { problems: parsed.problems })
    is Valid then holder.swap(parsed.config)
```
