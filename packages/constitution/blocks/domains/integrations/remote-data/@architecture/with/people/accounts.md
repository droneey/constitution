# Accounts

> Governs a session ended by a refused read.

## Ended sessions

### unauthenticated-failure-ends-the-session-once · MUST

Every unauthenticated failure ends the session once, in the remote-data cache's one failure handler, through the surface of the feature owning sessions. Such a failure is one of a read or a write made with the person's session that the remote transport's renewal of the session, where it has one, could not cure.

| Why |
|---|
| a session ended at each read or write that met its expiry ends several times and in several ways. |
