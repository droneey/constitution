# Observability

> Governs what a server's telemetry signals say of its instance, and where its logs go.

## Signals

### server-telemetry-names-its-instance → telemetry-carries-the-service-identity · SHOULD

Every telemetry signal of a server carries, beside its service's identity, the identity of the instance that sent it.

| Why |
|---|
| a fault of one instance, of its memory, its node or its release, is found only when that instance's telemetry signals can be told apart from its siblings'. |

## Logs

### server-log-leaves-as-a-stream → diagnostics-written-through-a-logger · MUST

Every log of a server leaves it as a stream, never as a file inside its instance. Its logging facade writes its log records to standard output or standard error, or to a collector over the network.

| Why |
|---|
| its host gathers every instance's stream in one place, while a file inside an instance is lost when the instance is replaced and fills its disk until then. |
