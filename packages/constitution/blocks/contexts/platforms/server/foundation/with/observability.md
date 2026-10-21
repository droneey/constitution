# Observability

> Governs what a server's signals say of its copy.

## General

### server-signal-names-its-copy → signal-carries-the-service-identity · SHOULD

Every log record and span of a server, and the resource its metrics are sent under, carry beside the service's identity the identity of the copy that sent them, as OpenTelemetry's resource conventions name it: `service.instance.id`.

| Why | Tags |
|---|---|
| a fault of one copy — its memory, its node, its release — is found only when that copy's signals can be told apart from its siblings'. | [] |
