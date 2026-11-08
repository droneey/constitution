# Pipeline

> Governs where the parts of the telemetry pipeline live, and the units that open the spans of a work item and of its calls to other systems and record its measures.

## Vocabulary

The **trace middleware** is the code every work item passes from its start to its outcome, such as a request's middleware or a consumer's wrapper, which binds the work item's trace id, opens its span and ends it with its outcome.

## General

### telemetry-mask-kept-in-libs → shared-piece-placed-by-meaning · SHOULD

The telemetry pipeline's mask is a module in `libs/` that knows nothing of the product but the keys it is handed.

| Why |
|---|
| a mask written into the product is proven only through the product's specs, and one that knows the product's keys itself changes with every feature that adds one. |

### trace-middleware-kept-in-libs → shared-piece-placed-by-meaning · SHOULD

The trace middleware is a module in `libs/` that knows nothing of the product.

| Why |
|---|
| a middleware written into the product proves its choice between the caller's trace id and a new one only through the product's specs, and one that reaches the logging library itself spreads that library beyond the root. |

## Instrumentation

### work-item-span-opened-by-the-trace-middleware · SHOULD

Every work item's span is opened by the trace middleware alone.

| Why |
|---|
| a span each unit opens for itself is opened twice for one work item or not at all, and is named and ended differently from one feature to the next, while the one middleware every work item passes opens it once and alike for all. |

### work-item-measured-by-the-trace-middleware · SHOULD

Every work item's rate, failures and duration are recorded by the trace middleware alone. Exempt: a measure derived from the work item's span outside the program, such as by its collector.

| Why |
|---|
| a measure each unit records for itself is recorded twice for one work item or not at all, and differs from one feature to the next, while the one middleware every work item passes records it once and alike for all. |

### outgoing-call-traced-by-the-unit-that-makes-it · SHOULD

Every call a work item makes to another system is traced by the unit that makes it. The call's span and the trace context it carries are written in that unit, an adapter or another unit at the edge, or by the client through which it reaches the system.

| Why |
|---|
| a call's span left to the use case, the adapter or a wrapper, each by its own choice, is written twice for one call or not at all, while the unit that makes the call, with its client, is the one place every such call passes. |
