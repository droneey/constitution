# Ports

> Governs a server's adapters at its boundaries: the check of its connection an adapter offers.

## General

### readiness-check-offered-by-the-adapter · SHOULD

Every adapter of a required system offers a check of its connection, which the readiness check runs. No port, use case or feature carries such a check.

| Why |
|---|
| how a system is reached is known only to its adapter, and a check put on a port asks every implementation, fakes included, for something no caller of the port needs — the interface segregation principle. |
