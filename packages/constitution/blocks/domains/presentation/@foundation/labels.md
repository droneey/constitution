# Labels

> Governs the labels of a screen's controls.

## General

### button-names-its-result · SHOULD

Every button's label names its result, a verb and its object, never "Submit" or "OK". A confirmation of a destructive action names that action. Exempt: "Cancel" and "Close", which serve a secondary action, and one label such as "Continue", which moves a flow to its next step.

| Why |
|---|
| a person reads the button to know what will happen, and a vague label makes them guess. |

### payment-button-shows-the-amount · SHOULD

Every button that pays shows the amount it pays.

| Why |
|---|
| a person who pays without seeing the amount on the button learns it from the receipt, and some find a total they did not agree to. |

### same-action-same-label · MUST

Every action carries the same label and the same accessible name wherever it appears, on every screen or step that offers it.

| Why |
|---|
| a person knows a control by its name, so a new name for the same action reads as a new action — WCAG 2.2, Consistent Identification. |

### switch-labelled-by-its-on-state · SHOULD

Every switch and checkbox is labelled by what it does when it is on, never by a negation: "Send notifications", never "Disable notifications" or "Don't send notifications".

| Why |
|---|
| a negated label turned off is a double negative, which the person must work out before they dare touch it. |
