# Analytics

### tracking-waits-for-consent · MUST
Nothing is tracked, and no identifier is stored, before the user consents; declining changes nothing else in the product.

| Why | Tags |
|---|---|
| tracking is the user's choice, and a product that tracks first and asks later has already taken it from them. | [security] |

### refusal-as-easy-as-consent → tracking-waits-for-consent
Refusing takes no more steps than accepting, where consent is first asked; every purpose is chosen on its own, and nothing is chosen in advance.

| Why | Tags |
|---|---|
| a refusal hidden behind a second step is consent taken, not given. | [security, ux] |

### consent-withdrawable-and-recorded · MUST
Consent can be withdrawn at any time as easily as it was given, and each choice is recorded with its time and purposes. A recorded refusal is not asked again for about six months, or until the purposes change.

| Why | Tags |
|---|---|
| the law asks both, and a record is the only proof the choice was the user's; asking again after a refusal wears the user down into a consent that is not free. | [security] |

### events-from-a-closed-vocabulary · MUST
Every event belongs to one closed vocabulary, each with its typed parameters; no free-form name or value is sent.

| Why | Tags |
|---|---|
| a mistyped event name is a report that silently reads zero. | [data] |

### analytics-fault-isolated → errors-surfaced-never-swallowed
A failing analytics destination, or a failure of the code that sends to it, neither breaks the user's action nor silences the other destinations; the fault is reported out of band.

| Why | Tags |
|---|---|
| measurement must never cost the user the thing they came to do. | [] |

### no-personal-data-in-events → no-secret-or-personal-data-in-output
No personal data and no content a person wrote is sent in an event.

| Why | Tags |
|---|---|
| analytics services are third parties; what reaches them has left the product's control. | [] |

### never-tracked-list-kept · SHOULD
The project keeps a written list of what is never tracked, and why.

| Why | Tags |
|---|---|
| the list stops the same question being answered differently each time, and shows users what is left out. | [data] |

### product-outcomes-tracked · SHOULD
Key product outcomes — a conversion, a reason something was blocked, the use of a product capability — have events, so business measures come from analytics.

| Why | Tags |
|---|---|
| a measure nobody tracks is a decision made without its data. | [data] |

### context-set-once-as-dimension · SHOULD
Context shared by every event — signed in or not, the mode — is set once, as a dimension.

| Why | Tags |
|---|---|
| every event then carries it without every call passing it. | [data] |

### event-names-object-action → events-named-in-past-tense
An analytics event is named after its object and the action done to it — `order_placed` — and its parameters in the same case.

| Why | Tags |
|---|---|
| one grammar makes the vocabulary readable and its names predictable. | [data] |

## Requirements for implementation

What any analytics library must provide.

### analytics-consent-first · MUST
The library sends nothing and stores no identifier until consent allows it.

| Why | Tags |
|---|---|
| without it, tracking cannot wait for consent. | [security] |

### analytics-anonymous-by-default · MUST
Addresses are anonymised, and no user identifier is sent unless configured.

| Why | Tags |
|---|---|
| a library that identifies users by default leaks personal data on its first event. | [security] |

### analytics-loads-without-blocking · SHOULD
The library loads and sends without delaying what the user waits for: a render, a response, a command.

| Why | Tags |
|---|---|
| measurement must not make the product slower to use. | [performance] |

### analytics-context-dimensions · SHOULD
Dimensions set once apply to every later event.

| Why | Tags |
|---|---|
| without it, shared context is passed with every event. | [data] |
