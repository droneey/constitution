```pseudo title="Avoid"
# …/bindings/commands/cancel-order
function refundLine(count)
  if count is 1 then
    return "1 item refunded."

  return format("{count} items refunded.",
    { count })
```

```pseudo title="Prefer"
# …/bindings/commands/cancel-order.messages
let oneItemRefunded = "1 item refunded."
let itemsRefunded = "{count} items refunded."

# …/bindings/commands/cancel-order
function refundLine(count)
  if count is 1 then
    return messages.oneItemRefunded

  return format(messages.itemsRefunded,
    { count })
```
