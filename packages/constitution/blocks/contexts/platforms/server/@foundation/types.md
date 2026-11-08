# Types

> Governs a value on a server and its type: the time zone its process runs in.

## Kinds of value

### server-process-time-zone-is-utc → time-never-read-in-the-machines-zone · MUST

Every server's process runs in UTC, never in its host's zone or in one its configuration chooses.

| Why |
|---|
| a library that falls back to the process's zone gives another answer on each host that runs an instance, and a time shown to a person follows the machine's zone instead of theirs. |
