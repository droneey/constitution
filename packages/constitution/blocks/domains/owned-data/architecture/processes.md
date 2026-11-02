# Processes

> Governs who decides the next step of a process that spans aggregates or features.

## General

### process-decided-by-an-aggregate-of-its-own · MUST

A process that spans several aggregates or features is decided by an aggregate of its own. Its transitions take each event, reply or deadline in the process's own terms and decide its next step or its compensation. Each event, reply or deadline has a use case that maps it into those terms, loads the process, calls the transition and saves the process with the steps it yielded for other parts to run, which leave only after that save commits; the binding unit that receives the event, reply or deadline binds that use case.

| Why |
|---|
| the next step of a long process is a business decision, and one made in a binding unit is proven by no spec of the domain model and copied by the next binding unit that needs it, while a step sent apart from the save that decided it is lost or repeated when the process stops between the two — a process manager, and the transactional outbox. |
