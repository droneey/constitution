# REST API with access control

> Governs how a REST operation answers a caller who is not let in.

## Authentication

### unauthenticated-request-answered-401-with-a-challenge · MUST
A REST request without valid credentials is answered `401` with a `WWW-Authenticate` challenge, and one whose credentials lack a right `403`.

| Why | Tags |
|---|---|
| a client tells a missing sign-in from a missing right by the status alone, and the challenge says how to sign in. | [security] |
