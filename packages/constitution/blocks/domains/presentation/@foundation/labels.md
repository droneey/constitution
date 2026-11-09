# Labels

> Governs the labels of a screen's controls.

## General

### button-names-its-result · SHOULD

Every button's label names its result, a verb and its object, never "Submit" or "OK". A confirmation of a destructive action names that action. Exempt: "Cancel" and "Close", which serve a secondary action, and one label such as "Continue", which moves a flow to its next step.

#### Why

A person reads the button to know what will happen, and a vague label makes them guess.

#### Examples

```pseudo title="Avoid"
Dialog(
  title: "Cancel your subscription?",
  actions: [
    Button(label: "Close", onPress: close),
    Button(label: "OK", onPress: cancelSubscription)
  ]
)
```

```pseudo title="Prefer"
Dialog(
  title: "Cancel your subscription?",
  actions: [
    Button(label: "Keep subscription", onPress: close),
    Button(label: "Cancel subscription", onPress: cancelSubscription)
  ]
)
```

### payment-button-shows-the-amount · SHOULD

Every button that pays shows the amount it pays.

#### Why

A person who pays without seeing the amount on the button learns it from the receipt, and some find a total they did not agree to.

#### Examples

```pseudo title="Avoid"
Button(label: "Pay now", onPress: payOrder)
```

```pseudo title="Prefer"
Button(label: "Pay " + formatMoney(order.total), onPress: payOrder)
```

### same-action-same-label · MUST

Every action carries the same label and the same accessible name wherever it appears, on every screen or step that offers it.

#### Why

A person knows a control by its name, so a new name for the same action reads as a new action — WCAG 2.2, Consistent Identification.

#### Examples

```pseudo title="Avoid"
# orders/presentation/components/order-row
IconButton(icon: Trash, accessibleName: "Remove order", onPress: confirmDelete)

# presentation/screens/order-screen
Button(label: "Delete order", onPress: confirmDelete)
```

```pseudo title="Prefer"
# orders/presentation/components/order-row
IconButton(icon: Trash, accessibleName: "Delete order", onPress: confirmDelete)

# presentation/screens/order-screen
Button(label: "Delete order", onPress: confirmDelete)
```

### switch-labelled-by-its-on-state · SHOULD

Every switch and checkbox is labelled by what it does when it is on, never by a negation: "Send notifications", never "Disable notifications" or "Don't send notifications".

#### Why

A negated label turned off is a double negative, which the person must work out before they dare touch it.

#### Examples

```pseudo title="Avoid"
Switch(
  label: "Disable order emails",
  isOn: settings.isOrderEmailsDisabled,
  onChange: setIsOrderEmailsDisabled
)
```

```pseudo title="Prefer"
Switch(
  label: "Send order emails",
  isOn: settings.isOrderEmailsOn,
  onChange: setIsOrderEmailsOn
)
```
