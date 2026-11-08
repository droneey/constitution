# Types

> Governs a value on a server and its type: the time zone its process runs in.

## Kinds of value

### server-process-time-zone-is-utc → time-never-read-in-the-machines-zone · MUST

Every server's process runs in UTC, never in its host's zone or in one its configuration chooses.

#### Why

A library that falls back to the process's zone gives another answer on each host that runs an instance, and a time shown to a person follows the machine's zone instead of theirs.

#### Examples

```dockerfile title="Avoid"
# each host that runs it may read times in Warsaw's zone
ENV TZ=Europe/Warsaw
CMD ["node", "dist/main.js"]
```

```dockerfile title="Prefer"
ENV TZ=UTC
CMD ["node", "dist/main.js"]
```
