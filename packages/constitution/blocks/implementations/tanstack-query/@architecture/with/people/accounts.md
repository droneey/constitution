# Accounts

> Governs a session ended by a refused read.

## General

### unauthenticated-failure-handled-by-the-caches-on-error → unauthenticated-failure-ends-the-session-once · MUST

Every unauthenticated failure is acted on only by `onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client.

| Why |
|---|
| a query or a mutation that acts on the error on its own ends the session in a way of its own, and one that forgets to leaves the user on a screen that no longer works. |
