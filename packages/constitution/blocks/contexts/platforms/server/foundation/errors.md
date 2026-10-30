# Errors

> Governs a failure in a server: one no handler owns.

## At the entries

### unowned-failure-ends-the-server → last-resort-handler-one-per-entry · MUST

A failure that no request, message or job owns — an uncaught exception, an unhandled rejection — reaches the process's handler of last resort, which logs it and ends the server through its stop path with a failing exit code.

| Why |
|---|
| such a failure leaves the process in a state no code foresaw, and one that runs on corrupts what it touches next; its host starts a fresh copy from a known state. |
