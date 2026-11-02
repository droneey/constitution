# Access control

> Governs a session ended by a refused read.

## General

### unauthenticated-failure-handled-once-in-the-cache → unauthenticated-failure-ends-the-session-once · MUST

An unauthenticated failure, a `401`, is handled once, in the cache. `onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, is the one place that acts on it.

| Why |
|---|
| a query or a mutation that acts on the error on its own ends the session in a way of its own, and one that forgets to leaves the user on a screen that no longer works. |
