# TanStack Query with access control

> The cache of a program whose callers sign in.

## unauthorized-handled-once-in-the-cache → unauthorized-ends-the-session-through-its-owner
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, turns an unauthorized error into session state through the surface of the feature that owns sessions, once.

| Why | Check | Tags |
|---|---|---|
| an expired session is handled the same way for every read and write. | review | [] |
