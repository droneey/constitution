# Tests

> Governs the spec of a server's stop.

## General

### server-stop-proven-by-a-spec · SHOULD

Every server's stop is proven by a spec. The spec starts the server, gives it work, tells it to stop while the work runs, and checks that the work finishes, that new work is refused once the pause for routing ends and that the stop ends within its bound.

| Why |
|---|
| the stop runs at every deployment and nowhere else, so a fault in it drops work at each release where no one is looking. |
