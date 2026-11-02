```pseudo title="Avoid"
function onConfigChanged(raw, holder)
  for key in raw.keys
    holder.set(key, raw[key])
```

```pseudo title="Prefer"
function onConfigChanged(raw, holder)
  let parsed = parseConfig(raw)

  when parsed
    is Invalid then logger.warn(
      "configuration refused",
      { problems: parsed.problems })
    is Valid then holder.swap(parsed.config)

function quoteShipping(request, holder)
  let config = holder.current()
  ...
```
