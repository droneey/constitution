# Events

> Governs an analytics event: its plan, its name, when it is sent, the personal data and the address it is kept without, where it goes and how a fault of one destination is contained.

## Vocabulary

An **analytics event** is a record of something done with the product, sent to an analytics service.

The **tracking plan** declares every analytics event the product sends, with its typed parameters and its meaning.

## Plan

### tracking-plan-is-the-one-vocabulary → fact-has-one-source · MUST

Every analytics event is declared in the tracking plan alone.

| Why |
|---|
| an event declared in two places drifts, so the plan and the code each count a different set — a single source of truth. |

### code-sends-only-planned-events · MUST

Every analytics event the code sends is one the tracking plan declares.

| Why |
|---|
| a mistyped name sent past the plan lands in a row nobody reads, so the event it meant reads zero in every report. |

### event-text-parameter-from-a-closed-set · MUST

Every text parameter of an analytics event that is no identifier takes its value from a set the tracking plan declares. It never takes a free value.

| Why |
|---|
| a free value splits one answer into many rows, so no report can count it as one. |

## Names

### event-names-object-action → event-name-in-past-tense · SHOULD

Every analytics event is named by its object and the action done to it.

| Why |
|---|
| names built each their own way make the vocabulary unpredictable, so one action is tracked under two names and a report reads only one of them. |

### event-parameters-named-in-its-case · SHOULD

Every parameter of an analytics event is named in the case of its event's name.

| Why |
|---|
| a parameter named in another case than its event is mistyped by every reader who guesses it from the name, and reads empty in the report. |

### event-never-renamed · MUST

No analytics event, once sent, is renamed.

| Why |
|---|
| a renamed event breaks every report that spans the change. |

### event-meaning-changed-only-by-a-new-event · MUST

Every change of an analytics event's meaning makes a new event, and the old one is retired. That holds for a change that leaves its name and parameters as they are.

| Why |
|---|
| an event redefined under its old name breaks every report that spans the change, which goes on adding two meanings as one. |

## Sending

### event-sent-once-per-occurrence → operation-idempotent-by-design · MUST

Every analytics event is sent once per occurrence of what it records. A screen that redraws, a request that retries or a handler that runs twice sends it no second time.

| Why |
|---|
| an event sent twice doubles its measure, and nobody can tell afterwards which half is real. |

### critical-scenario-outcome-has-an-event · SHOULD

Every outcome of each critical scenario of `PROJECT.md` has an analytics event: succeeded, abandoned, or blocked and why.

| Why |
|---|
| the measures that matter are the ones the product exists for, and one nobody tracks is a decision made without its data. |

## Personal data

### event-names-no-person → personal-data-kept-out-of-output · MUST

No analytics event carries personal data or content a person wrote. Such data includes a name, an email, a phone number, an address and any other identifier of a person, an account's identifier or a hash of it among them. Exempt: the analytics library's own pseudonymous identifier, and an account's identifier that the inventory lists for analytics, sent once its person gave processing consent.

| Why |
|---|
| analytics services are third parties, so personal data an event carries leaves the product's control, where no erasure the product makes reaches it, and an account's identifier joins each person's use there to the product's own records, a join only its listing and its person's processing consent let it make — data minimisation. |

### event-stored-without-its-ip-address · MUST

Every analytics event is stored by its analytics service with the IP address it came from truncated or dropped.

| Why |
|---|
| a service that keeps the address each event comes from identifies its person by it, so personal data leaks on the first event — privacy by default. |

## Destinations

### environment-sends-to-its-own-destination · MUST

Every deployment environment sends its analytics events to its own destination or to none.

| Why |
|---|
| one test run sent to production's reports is a spike nobody can take back out. |

## Faults

### analytics-fault-isolated → optional-part-isolated-from-its-faults · MUST

Every analytics destination is isolated from the others' faults. One that fails, or whose sending code fails, never stops the events sent to the rest.

| Why |
|---|
| one broken service would otherwise blind every report, not only its own — the bulkhead pattern. |
