# Remote data with access control

> Governs a session ended by a refused read.

## Ended sessions

### unauthenticated-failure-ends-the-session-once · MUST
An unauthenticated failure of any read or write is acted on once, by the cache's one failure handler, which ends the session through the surface of the feature that owns sessions; a forbidden failure ends no session.

| Why | Tags |
|---|---|
| a session that expires during any read or write then ends the same way in one place, and a refusal of one action does not sign the user out. | [errors, security] |
