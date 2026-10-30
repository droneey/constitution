# Types

> Governs a value on a server and its type: the time zone of its process.

## Kinds of value

### server-process-time-zone-is-utc → instant-is-an-exact-time · MUST

A server's process runs with its time zone set to UTC, never to its host's zone or to one its configuration chooses; a local time is computed from a zone the data names.

| Why |
|---|
| a library that falls back to the process's zone then gives one answer on every copy, whichever host runs it, and a time shown to a person follows that person's zone, not the machine's. |
