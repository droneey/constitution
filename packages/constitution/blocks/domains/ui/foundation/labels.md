# Labels

> Governs the labels of a screen's controls.

## General

### button-names-its-result · SHOULD

A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action, and one label such as "Continue" moves a flow to its next step; a confirmation of a destructive action names the action; a payment button shows the amount.

| Why |
|---|
| a person reads the button to know what will happen; a vague label makes them guess. |

### same-action-same-label · MUST

A control that does the same thing on several screens or steps carries the same label on each.

| Why |
|---|
| a user knows a control by its name, so a new name for the same action reads as a new action. |

### switch-labelled-by-its-on-state · SHOULD

A switch or a checkbox is labelled by what it does when it is on, never by a negation: "Send notifications", never "Disable notifications" or "Don't send notifications".

| Why |
|---|
| a negated label turned off is a double negative, which the user must work out before they dare touch it. |
