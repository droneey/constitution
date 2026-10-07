---
id: analytics
summary: Typed product events, sent to replaceable analytics services.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/sinks/**"]
---
# Analytics

> Events about how people use the product, sent to one or more analytics services.

## Events

### tracking-plan-is-the-one-vocabulary → fact-has-one-source · MUST
Every event, its typed parameters and its meaning are declared in one tracking plan, a closed vocabulary: the code sends only from it, a text parameter takes its value from a closed set, and the reports are read by it.

| Why | Tags |
|---|---|
| an event declared in two places drifts, a mistyped name reads zero, and a free value splits one answer into many rows. | [data] |

### event-names-object-action → event-name-in-past-tense · SHOULD
An analytics event is named after its object and the action done to it — `order_placed` — and its parameters in the same case.

| Why | Tags |
|---|---|
| one grammar makes the vocabulary readable and its names predictable. | [data] |

### event-sent-once-per-occurrence · MUST
An event is sent once for each time what it records happens — never again when a screen redraws, a request retries or a handler runs twice.

| Why | Tags |
|---|---|
| an event sent twice doubles its measure, and nobody can tell afterwards which half is real. | [data] |

### event-never-renamed · SHOULD
An event, once sent, keeps its name and its meaning; a change of meaning is a new event, and the old one is retired.

| Why | Tags |
|---|---|
| a renamed or redefined event breaks every report that spans the change. | [data] |

### context-set-once-as-dimension · SHOULD
Context shared by every event — signed in or not, the mode — is set once, as a dimension.

| Why | Tags |
|---|---|
| every event then carries it without every call passing it. | [data] |

### critical-scenario-outcome-has-an-event · SHOULD
The outcome of every critical scenario of `PROJECT.md` — completed, abandoned, blocked and why — has an event.

| Why | Tags |
|---|---|
| the measures that matter are the ones the product exists for, and one nobody tracks is a decision made without its data. | [data] |

## Data

### event-carries-no-personal-data → secret-and-personal-data-kept-out-of-output · MUST
No event carries personal data or content a person wrote.

| Why | Tags |
|---|---|
| analytics services are third parties, and what reaches them has left the product's control. | [security, data] |

### never-tracked-list-kept · SHOULD
The project keeps a written list of what is never tracked, and why.

| Why | Tags |
|---|---|
| the list stops the same question being answered differently each time, and shows users what is left out. | [data] |

### environment-sends-to-its-own-destination · MUST
Each environment — development, preview, production — sends to its own destination or to none, so only production's events reach production's reports.

| Why | Tags |
|---|---|
| one test run sent to production's reports is a spike nobody can take back out. | [data] |

## Faults

### analytics-fault-isolated → optional-part-isolated-from-its-faults · MUST
A failing analytics destination, or a failure of the code that sends to it, neither breaks the user's action nor silences the other destinations; the fault is reported out of band.

| Why | Tags |
|---|---|
| measurement must never cost the user the thing they came to do. | [errors] |

## Requirements for implementation

### analytics-anonymous-by-default · MUST
The library truncates or drops the IP address, and sends no user identifier unless it is configured to.

| Why | Tags |
|---|---|
| a library that identifies users by default leaks personal data on its first event. | [security, data] |

### analytics-loads-without-blocking · SHOULD
The library loads and sends without delaying what the user waits for: a render, a response, a command.

| Why | Tags |
|---|---|
| measurement must not make the product slower to use. | [performance] |
