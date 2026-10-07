# TanStack Query with access control

> Governs a session ended by a refused read.

### unauthorized-handled-once-in-the-cache → unauthenticated-failure-ends-the-session-once · MUST
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, is the one place that acts on an unauthorized error.

| Why | Tags |
|---|---|
| every read and write then ends in the same handler, and no query or mutation acts on the error on its own. | [] |
