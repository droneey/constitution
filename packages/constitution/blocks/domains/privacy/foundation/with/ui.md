# User interface

> Governs the controls of consent on a screen.

## Controls

### consent-changed-from-every-screen · MUST

The way to change consent is reachable from every screen. This holds where the product asks for consent, and changing it takes no more steps than giving it took.

| Why |
|---|
| a choice changed only from one place is out of reach wherever the person is, so withdrawing becomes harder than giving was. |

### refusal-shown-beside-consent · MUST

The control that refuses sits beside the one that accepts, with the same size and the same weight.

| Why |
|---|
| a refusal drawn smaller or fainter than the consent beside it steers the user to accept. |

### blocked-content-loads-on-the-persons-click · SHOULD

Third-party content waiting for consent loads on the person's click. Until then it leaves a placeholder that says what loading it shares and with whom.

| Why |
|---|
| without the placeholder the person meets a gap where the content matters to them, and must decide elsewhere, without knowing what loading it costs. |

### honoured-opt-out-shown · MUST

A person can see that their opt-out signal was honoured. This holds where the law of the region the product serves asks it.

| Why |
|---|
| a choice the person cannot see honoured is a choice they cannot trust. |
