# Events

> Governs an event: its plan, its name, when it is sent, what it carries and where it goes, and a fault of the analytics that sends it.

## General

### tracking-plan-is-the-one-vocabulary → fact-has-one-source · MUST

Every event, its typed parameters and its meaning are declared in one tracking plan, a closed vocabulary: the code sends only from it, a text parameter takes its value from a closed set, and the reports are read by it.

| Why |
|---|
| an event declared in two places drifts, a mistyped name reads zero, and a free value splits one answer into many rows. |

### event-names-object-action → event-name-in-past-tense · SHOULD

An analytics event is named after its object and the action done to it — `order_placed` — and its parameters in the same case.

| Why |
|---|
| one grammar makes the vocabulary readable and its names predictable. |

### event-sent-once-per-occurrence · MUST

An event is sent once for each time what it records happens — never again when a screen redraws, a request retries or a handler runs twice.

| Why |
|---|
| an event sent twice doubles its measure, and nobody can tell afterwards which half is real. |

### event-never-renamed · SHOULD

An event, once sent, keeps its name and its meaning; a change of meaning is a new event, and the old one is retired.

| Why |
|---|
| a renamed or redefined event breaks every report that spans the change. |

### critical-scenario-outcome-has-an-event · SHOULD

The outcome of every critical scenario of `PROJECT.md` — completed, abandoned, blocked and why — has an event.

| Why |
|---|
| the measures that matter are the ones the product exists for, and one nobody tracks is a decision made without its data. |

## Data

### event-names-no-person → secret-and-personal-data-kept-out-of-output · MUST

No event carries data that names a person — a name, an email, a phone, an address — or content a person wrote; the only identifier an event carries is the analytics library's own pseudonymous one.

| Why |
|---|
| analytics services are third parties, and what reaches them has left the product's control. |

### environment-sends-to-its-own-destination · MUST

Each environment — development, preview, production — sends to its own destination or to none, so only production's events reach production's reports.

| Why |
|---|
| one test run sent to production's reports is a spike nobody can take back out. |

## Faults

### analytics-fault-isolated → optional-part-isolated-from-its-faults · MUST

A failing analytics destination, or a failure of the code that sends to it, neither breaks the user's action nor silences the other destinations; the fault is reported out of band.

| Why |
|---|
| measurement must never cost the user the thing they came to do. |

## Requirements for implementation

### analytics-drops-the-ip-address · MUST

The library truncates or drops the IP address.

| Why |
|---|
| a library that identifies users by default leaks personal data on its first event. |
