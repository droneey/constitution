# Access control

> Governs a session ended by a refused read.

## Ended sessions

### unauthenticated-failure-ends-the-session-once · MUST

An unauthenticated failure ends the session once, in the cache's one failure handler. Such a failure is one of a read or write made with the person's session that the transport's renewal of the session, where it has one, could not cure; the handler ends the session through the surface of the feature that owns sessions, and a forbidden failure ends no session.

| Why |
|---|
| a session ended at each read or write that met its expiry ends several times and in several ways, and a forbidden failure taken for an ended session signs the user out for the refusal of one action. |
