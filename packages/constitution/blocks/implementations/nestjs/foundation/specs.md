# Specs

> Governs how a spec builds the Nest program it drives.

## General

### specs-through-the-testing-module → server-spec-runs-in-process · MUST

A spec builds the app through Nest's testing module. It builds it from the root's module with `Test.createTestingModule`, binds each adapter's token to a fake with `overrideProvider`, runs `init()` and `close()` inside the case, and sends its requests to the app in the spec's process — by `app.inject()` on the Fastify platform, or by supertest on `app.getHttpServer()`, which listens on a loopback port the system chooses.

| Why |
|---|
| a spec that assembles its own modules proves another program than the one that ships, and one that skips `close()` leaves what the case opened open for the next. |
