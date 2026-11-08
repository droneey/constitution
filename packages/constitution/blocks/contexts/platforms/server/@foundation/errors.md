# Errors

> Governs a failure in a server that no request, message or job owns.

## At the interfaces

### unowned-failure-ends-the-server → failure-ends-the-program-only-at-the-last-resort · MUST

Every failure that no request, message or job owns ends the server with a failing exit code, its pause for routing skipped. Such failures include an uncaught exception and an unhandled rejection.

#### Why

Such a failure leaves the process in a state no code foresaw, and one that runs on, or goes on serving through a pause, corrupts what it touches next, while its host starts a fresh instance from a known state — fail fast.

#### Examples

```ts title="Avoid"
// src/root/unowned-failures.ts
export const reportUnownedFailures = (logger: Logger): void => {
  process.on("uncaughtException", (failure) => {
    logger.error({ err: failure }, "unowned failure");   // logs it and serves on
  });
};
```

```ts title="Prefer"
// src/root/unowned-failures.ts
export const endOnUnownedFailures = (logger: Logger): void => {
  const end = (failure: unknown): never => {
    logger.fatal({ err: failure }, "unowned failure");
    process.exit(1);
  };

  process.on("uncaughtException", end);
  process.on("unhandledRejection", end);
};
```
