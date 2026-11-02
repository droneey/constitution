# Events

> Governs an event: its plan, its name, when it is sent, what it carries and where it goes, and a fault of the analytics that sends it.

## General

### tracking-plan-is-the-one-vocabulary → fact-has-one-source · MUST

The tracking plan is the one vocabulary of events. Every event, its typed parameters and its meaning are declared in one tracking plan, a closed vocabulary: the code sends only from it, a text parameter takes its value from a closed set, and the reports are read by it.

| Why |
|---|
| an event declared in two places drifts, a mistyped name reads zero, and a free value splits one answer into many rows — a single source of truth. |

### event-names-object-action → event-name-in-past-tense · SHOULD

An analytics event is named by its object and the action done to it. Its parameters are named in the same case.

| Why |
|---|
| names built each their own way make the vocabulary unpredictable, so one action is tracked under two names and a report reads only one of them. |

### event-sent-once-per-occurrence · MUST

An event is sent once per occurrence. An occurrence is each time what it records happens, and a screen that redraws, a request that retries or a handler that runs twice sends it no second time.

| Why |
|---|
| an event sent twice doubles its measure, and nobody can tell afterwards which half is real. |

### event-never-renamed · SHOULD

An event, once sent, is never renamed. It keeps its name and its meaning; a change of meaning is a new event, and the old one is retired.

| Why |
|---|
| a renamed or redefined event breaks every report that spans the change. |

### critical-scenario-outcome-has-an-event · SHOULD

The outcome of every critical scenario of `PROJECT.md` — completed, abandoned, blocked and why — has an event.

| Why |
|---|
| the measures that matter are the ones the product exists for, and one nobody tracks is a decision made without its data. |

## Destinations

### environment-sends-to-its-own-destination · MUST

Each environment sends to its own destination or to none. Whatever the environment — development, preview, production — only production's events reach production's reports.

| Why |
|---|
| one test run sent to production's reports is a spike nobody can take back out. |

## Faults

### analytics-fault-isolated → optional-part-isolated-from-its-faults · MUST

Each analytics destination is isolated from the others' faults. One that fails, or whose sending code fails, never stops the events sent to the rest.

| Why |
|---|
| one broken service would otherwise blind every report, not only its own — the bulkhead pattern. |
