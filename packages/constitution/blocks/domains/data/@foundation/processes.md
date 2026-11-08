# Processes

> Governs a business process that spans several programs or transactions.

## General

### multi-step-process-compensated · MUST

Every business process spanning several programs or transactions is unwound once one of its steps is refused or abandoned. It runs a compensating step, one that undoes what a step wrote, for each earlier step that may have taken effect and that the business does not yet count as done.

| Why |
|---|
| no transaction spans programs, so a process that fails midway is either undone step by step or left half done, while a step undone on a failure a retry may still clear, or after the business counts it as done, takes back what should have stood — the compensating transaction pattern. |

### multi-step-process-state-kept-in-a-store · MUST

Every business process that spans several programs or transactions keeps its state in a store, never in memory alone. Exempt: a process its caller runs again from its first step after a stop, every step of it idempotent.

| Why |
|---|
| a process whose state lives only in memory is lost with the program that held it, with no record of which steps took effect or how to undo them — the compensating transaction pattern. |
