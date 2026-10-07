# Streams

> Governs a stream of events from another system.

## Ends

### stream-cut-before-its-terminal-event-fails → failure-is-expected-or-defect · MUST
A stream that ends without its terminal event fails with an expected failure of its own type, never ends as complete.

| Why | Tags |
|---|---|
| a stream cut short otherwise looks like a complete one, and the user takes a partial result for the final one. | [errors, data] |
