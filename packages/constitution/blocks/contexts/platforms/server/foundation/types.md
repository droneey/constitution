# Types

> Governs a value on a server and its type: the time zone of its process.

## Kinds of value

### server-process-time-zone-is-utc → instant-is-an-exact-time · MUST

A server's process runs in UTC. Its time zone is never its host's or one its configuration chooses; a local time is computed from a zone the data names.

| Why |
|---|
| a library that falls back to the process's zone gives another answer on each host that runs a copy, and a time shown to a person follows the machine's zone instead of theirs. |
