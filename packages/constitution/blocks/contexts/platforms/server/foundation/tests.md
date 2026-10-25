# Tests

> Governs the spec of the stop, and the framework a spec starts.

## General

### server-stop-proven-by-a-spec · SHOULD

A server has a spec that starts it, gives it work, tells it to stop while the work runs, and checks that the work finishes, new work is refused and the process exits within its bound.

| Why |
|---|
| the stop runs at every deployment and nowhere else, so a fault in it drops work at each release where no one is looking. |

## Requirements for implementation

### server-framework-started-and-stopped-in-a-spec · MUST

A server's framework can be started and stopped by a spec inside its process, listening on a port the system chooses.

| Why |
|---|
| without it, the spec of the stop reaches a fixed port shared with other runs, or cannot stop the server it started. |
