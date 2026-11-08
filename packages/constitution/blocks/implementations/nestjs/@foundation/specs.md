# Specs

> Governs how a spec builds, drives and closes the Nest program.

## General

### specs-through-the-testing-module → server-spec-runs-in-process · MUST

Every unit or integration spec that drives the Nest server builds it from the root's module with `Test.createTestingModule`. It sends its requests in the spec's process, by `app.inject()` where the HTTP library Nest runs on offers it, or by supertest on `app.getHttpServer()`. Exempt: an end-to-end spec, and a spec that proves the server's own start or stop.

| Why |
|---|
| a spec that assembles its own modules proves another program than the one that ships. |

### nest-app-closed-inside-its-case → case-independent-of-order · MUST

Every Nest spec that builds its app with `Test.createTestingModule` runs its `init()` and `close()` inside its case.

| Why |
|---|
| an app a case leaves open keeps its connections and timers for the next case, which then passes or fails by what ran before it, and keeps the runner from ending. |

### nest-spec-endpoint-left-to-the-system → server-spec-port-chosen-by-the-system · MUST

Every Nest spec that has its app listen has it listen by `app.listen(0, '127.0.0.1')`, before supertest drives `app.getHttpServer()`.

| Why |
|---|
| a spec that listens on a fixed endpoint collides with another run's, and fails at random when specs run side by side. |
