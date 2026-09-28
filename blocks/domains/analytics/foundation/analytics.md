# Analytics

## tracking-waits-for-consent · MUST
Nothing is tracked, and no identifier is stored, before the user consents; declining changes nothing else in the product.

| Why | Check | Tags |
|---|---|---|
| tracking is the user's choice, and a product that tracks first and asks later has already taken it from them. | review | [security] |

## events-from-a-closed-vocabulary → illegal-states-unrepresentable
Every event belongs to one closed vocabulary, each with its typed parameters; no free-form name or value is sent.

| Why | Check | Tags |
|---|---|---|
| a mistyped event name is a report that silently reads zero. | review | [data] |

## analytics-fault-isolated → errors-surfaced-never-swallowed
A failing analytics destination, or a failure of the code that sends to it, neither breaks the user's action nor silences the other destinations; the fault is reported out of band.

| Why | Check | Tags |
|---|---|---|
| measurement must never cost the user the thing they came to do. | test | [] |

## no-personal-data-in-events → no-secret-or-personal-data-in-output
No personal data and no content a person wrote is sent in an event.

| Why | Check | Tags |
|---|---|---|
| analytics services are third parties; what reaches them has left the product's control. | review | [] |

## never-tracked-list-kept · SHOULD
The project keeps a written list of what is never tracked, and why.

| Why | Check | Tags |
|---|---|---|
| the list stops the same question being answered differently each time, and shows users what is left out. | review | [data] |

## product-outcomes-tracked · SHOULD
Key product outcomes — a conversion, a reason something was blocked, the use of a product capability — have events, so business measures come from analytics.

| Why | Check | Tags |
|---|---|---|
| a measure nobody tracks is a decision made without its data. | review | [data] |

## context-set-once-as-dimension · SHOULD
Context shared by every event — signed in or not, the mode — is set once, as a dimension.

| Why | Check | Tags |
|---|---|---|
| every event then carries it without every call passing it. | review | [data] |

## Requirements for implementation

What any analytics library must provide.

## analytics-consent-first · MUST
The library sends nothing and stores no identifier until consent allows it.

| Why | Check | Tags |
|---|---|---|
| without it, tracking cannot wait for consent. | review | [security] |

## analytics-anonymous-by-default · MUST
Addresses are anonymised, and no user identifier is sent unless configured.

| Why | Check | Tags |
|---|---|---|
| a library that identifies users by default leaks personal data on its first event. | review | [security] |

## analytics-loads-without-blocking · SHOULD
The library loads and sends without delaying rendering.

| Why | Check | Tags |
|---|---|---|
| measurement must not make the product slower to use. | review | [performance] |

## analytics-context-dimensions · SHOULD
Dimensions set once apply to every later event.

| Why | Check | Tags |
|---|---|---|
| without it, shared context is passed with every event. | review | [data] |
