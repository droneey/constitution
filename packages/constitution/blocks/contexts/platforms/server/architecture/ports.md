# Ports

> Governs the readiness check an adapter offers.

## General

### readiness-check-offered-by-the-adapter · SHOULD

An adapter of a system the server cannot serve without offers a check of its connection, which the composition root registers with the readiness probe; no port, use case or feature carries a health check.

| Why |
|---|
| how a system is reached is known only to its adapter, and a check put on a port asks every implementation, fakes included, for something no caller of the port needs. |
