# Consent

> Governs consent: when it is asked, what waits for it, how it is given, recorded and withdrawn.

## What is asked

### consent-asked-only-where-the-law-requires-it · SHOULD
Consent is asked only for a processing the law of the region the product serves subjects to it — storing on or reading from the device what the service the person asked for does not need, tracking across sites, advertising — unless the product chooses to ask for more; what that law allows without consent runs without asking.

| Why | Tags |
|---|---|
| a request for consent the law does not ask wears people down into clicking through every request, the ones that matter included. | [data, ux] |

## Before consent

### processing-waits-for-its-consent · MUST
A processing that needs consent does not begin before the person consents to its purpose: nothing is stored on or read from their device for it, no identifier is set, and no request reaches its third party — an embedded video, a map, a chat widget, a social button or an advertising pixel loads only after it.

| Why | Tags |
|---|---|
| a product that tracks first and asks later has already taken the choice from the person. | [security, data] |

### declined-consent-costs-nothing-else · MUST
Declining consent changes nothing in the product beyond the processing declined.

| Why | Tags |
|---|---|
| consent paid for with a feature is not given freely, and the law does not count it. | [ux, data] |

## Asking

### refusal-as-easy-as-consent · MUST
Refusing takes no more steps than consenting, where consent is first asked.

| Why | Tags |
|---|---|
| a refusal hidden behind a second step is consent taken, not given. | [security, ux] |

### consent-given-per-purpose-never-in-advance · MUST
Consent is given for each purpose on its own, and no purpose is chosen in advance.

| Why | Tags |
|---|---|
| a bundle of purposes or a box ticked in advance is consent taken, not given. | [security, ux] |

## Record and withdrawal

### consent-withdrawn-as-easily-as-given · MUST
Consent can be withdrawn at any time, as easily as it was given, and the processing it allowed stops at once.

| Why | Tags |
|---|---|
| consent that cannot be taken back as easily was never freely given. | [security, ux] |

### consent-choice-recorded · MUST
Each choice — a consent, a refusal, a withdrawal — is recorded with its time and its purposes.

| Why | Tags |
|---|---|
| the record is the only proof the choice was the person's, and the law asks for it. | [security, data] |

### refusal-respected-for-the-set-period · SHOULD
A recorded refusal is not asked about again for the period the project sets — six months in France, by the CNIL's guidance — unless the purposes change.

| Why | Tags |
|---|---|
| asking again after a refusal wears the person down into a consent that is not free. | [ux] |
