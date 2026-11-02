# Ports

> Governs a server's adapters at its boundaries: the readiness check an adapter offers.

## General

### readiness-check-offered-by-the-adapter · MUST

An adapter of a system the server cannot serve without offers a check of its connection. The composition root registers it with the readiness probe; no port, use case or feature carries a health check.

| Why |
|---|
| how a system is reached is known only to its adapter, and a check put on a port asks every implementation, fakes included, for something no caller of the port needs — the interface segregation principle. |
