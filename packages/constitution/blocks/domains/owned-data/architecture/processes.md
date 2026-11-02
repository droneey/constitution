# Processes

> Governs where the state of a process that spans aggregates or features lives, and who decides its next step.

## General

### process-kept-by-the-aggregate-whose-lifecycle-it-is · MUST

A process is kept and decided by the aggregate whose lifecycle it is. A process, as this block means one, is work of several steps with a state of its own — what is done, what waits, a compensation, a deadline —; its state lives in a feature's aggregate where the process is that aggregate's lifecycle, as an order's status moves from paid to sent, and otherwise in an aggregate of its own, in the feature whose aggregates it spans or in a composition module where it spans features, never in a binding unit or in memory. Its transitions take each event, reply or deadline in the process's own terms and decide its next step or its compensation. Each event, reply or deadline has a use case that maps it into those terms, loads the process, calls the transition and saves the process with the steps it yielded for other parts to run, which leave only after that save commits; the binding unit that receives the event, reply or deadline binds that use case. A reaction of one step, which keeps no state, needs no aggregate.

| Why |
|---|
| the next step of a long process is a business decision, and one made in a binding unit is proven by no spec of the domain model and copied by the next binding unit that needs it, a process given an aggregate of its own while a feature's aggregate already holds its state keeps one fact in two places, and a step sent apart from the save that decided it is lost or repeated when the process stops between the two — a process manager, and the transactional outbox. |
