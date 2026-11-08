# Logging

> Governs which units log what a use case did, and the one unit that decides where the records go and imports the library that writes them.

## Who logs

### domain-and-application-log-nothing · MUST

The domain layer and the application layer leave logging to their callers and log nothing.

| Why |
|---|
| a domain layer or a use case that logs decides what an operator is told, which only its caller knows enough to decide. |

### binding-unit-logs-what-its-use-case-did · SHOULD

Every binding or delivery unit logs what its use case did, a failure the use case handled included. Exempt: a failure the use case contained and reported through the fault reporter, which that report already tells.

| Why |
|---|
| a use case logs nothing, so what it did is told to no operator unless the unit that called it tells it. |

## Sinks

### root-alone-configures-logging · MUST

Only the composition root decides where the logging facade's records go.

| Why |
|---|
| sinks configured in several places send records where no one place decides, and a test cannot replace them without touching the code that configured them. |

### logging-library-imported-only-by-the-root · MUST

Only the composition root imports the library that writes the logging facade's records to their sinks. Exempt: that library where it is also the facade.

| Why |
|---|
| a unit that imports the logging library is bound to it past the facade, so replacing the library, or reading its records in a spec, means changing every such unit. |
