# Streams

> Governs a stream of events from another system.

## Ends

### stream-cut-before-its-terminal-event-fails → failure-is-expected-or-defect · MUST

Every stream that ends without its terminal event fails with an expected failure of its own type, never ending as complete.

| Why |
|---|
| a stream broken off otherwise looks like a complete one, and the user takes a partial result for the final one. |
