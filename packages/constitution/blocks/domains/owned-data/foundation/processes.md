# Processes

> Governs a business process that spans several programs or transactions.

## General

### multi-step-process-compensated · SHOULD

A business process that spans several programs or transactions is compensated step by step. It keeps its state in a store, runs each step in a transaction of its own, and runs a compensating step for each step already done when a later one fails for good or a wait for a reply passes its deadline.

| Why |
|---|
| no transaction spans programs, so a process that fails midway is either undone step by step or left half done, and one whose state lives only in memory is lost with the process that held it — the saga pattern. |
