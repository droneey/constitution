# Tests

> Governs the spec of a server's stop.

## General

### server-stop-proven-by-a-spec · SHOULD

Every server's stop is proven by a spec. The spec starts the server, gives it work, tells it to stop while the work runs, and checks that the work finishes, that new work is refused once the pause for routing ends and that the stop ends within its bound.

#### Why

The stop runs at every deployment and nowhere else, so a fault in it drops work at each release where no one is looking.

#### Examples

```ts title="Avoid"
test("should stop when told to", async () => {
  // Arrange
  const server = await startServer({ outside: createOutsideFakes() });

  // Act
  await server.stop();

  // Assert
  expect(server.isListening()).toBe(false);   // proves nothing of the work in flight
});
```

```ts title="Prefer"
test("should finish the request in flight and refuse new ones when told to stop", async () => {
  // Arrange
  const reports = createHeldReportsFake();
  const server = await startServer({ outside: createOutsideFakes({ reports }), pauseForRoutingMs: 50 });
  const inFlight = fetch(new URL("/reports/monthly", server.url));
  await reports.requested;

  // Act
  const startedAt = performance.now();
  const stopped = server.stop();
  reports.release();
  const answer = await inFlight;
  await stopped;

  // Assert
  expect(answer.status).toBe(200);
  expect(performance.now() - startedAt).toBeLessThan(stopBoundMs);
  await expect(fetch(new URL("/orders", server.url))).rejects.toThrow();
});
```
