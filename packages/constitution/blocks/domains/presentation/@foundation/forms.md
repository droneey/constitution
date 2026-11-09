# Forms

> Governs a form: its fields, validation and submission.

## Fields

### field-declares-its-kind · SHOULD

Wherever the platform offers a way to declare it, every field declares the kind of value it takes. Such kinds include an email address, a number, a telephone number and a one-time code.

#### Why

A field that hides its kind gets the wrong keyboard and no announcement of what it takes, so the person types on a keyboard made for something else.

#### Examples

```pseudo title="Avoid"
TextField(label: "Email", name: "email")
TextField(label: "Quantity", name: "quantity")
TextField(label: "Sign-in code", name: "code")
```

```pseudo title="Prefer"
TextField(label: "Email", name: "email", kind: Email)
TextField(label: "Quantity", name: "quantity", kind: Number)
TextField(label: "Sign-in code", name: "code", kind: OneTimeCode)
```

### own-data-field-declares-its-purpose · MUST

Wherever the platform offers a way to, every field of the person's own data declares its purpose. Such data includes their name, their postal address and their email.

#### Why

A field that hides its purpose cannot be filled in by the device, and the person types by hand what it already knows — WCAG 2.2, Identify Input Purpose.

#### Examples

```pseudo title="Avoid"
TextField(label: "Full name", name: "fullName")
TextField(label: "Street", name: "street")
TextField(label: "Postal code", name: "postalCode")
```

```pseudo title="Prefer"
TextField(label: "Full name", name: "fullName", purpose: FullName)
TextField(label: "Street", name: "street", purpose: StreetAddress)
TextField(label: "Postal code", name: "postalCode", purpose: PostalCode)
```

### field-labelled-visibly · MUST

Every field has a visible label. A placeholder is no label, only an example of the value.

#### Why

A placeholder vanishes as the person types, so they forget what the field asked for, and many read it as a value already filled in — WCAG 2.2, Labels or Instructions.

#### Examples

```pseudo title="Avoid"
TextField(
  name: "email",
  kind: Email,
  placeholder: "Email"
)
```

```pseudo title="Prefer"
TextField(
  label: "Email",
  name: "email",
  kind: Email,
  placeholder: "ana@example.com"
)
```

### field-shows-the-form-it-takes · MUST

Every field that takes only one of several forms of its value shows a hint of that form. Such a hint gives the order of a date or the length of a code.

#### Why

A person who types a value in another form, such as a date in the order their country uses, is refused without knowing why — WCAG 2.2, Labels or Instructions.

#### Examples

```pseudo title="Avoid"
TextField(
  label: "Card expiry",
  name: "cardExpiry",
  purpose: CardExpiry
)
```

```pseudo title="Prefer"
TextField(
  label: "Card expiry",
  hint: "MM/YY, as printed on the card",
  name: "cardExpiry",
  purpose: CardExpiry
)
```

### field-never-blocks-paste-or-autofill · MUST

No field blocks pasting or autofill. A field accepts a password manager's filling, and a one-time code field accepts the code the platform offers.

#### Why

Blocking them turns sign-in into a test of memory and pushes people to weaker passwords — WCAG 2.2, Accessible Authentication (Minimum).

#### Examples

```pseudo title="Avoid"
TextField(
  label: "Password",
  name: "password",
  kind: Password,
  purpose: CurrentPassword,
  onPaste: function(event) event.cancel()
)
```

```pseudo title="Prefer"
TextField(
  label: "Password",
  name: "password",
  kind: Password,
  purpose: CurrentPassword
)
```

### entered-information-never-asked-twice · MUST

No information a person entered in a process is asked for again in it; it is filled in or offered for selection. Exempt: information that entering again is essential to, information that entering again secures, such as a new password confirmed, and information that is no longer valid.

#### Why

A person who must type the same thing twice makes mistakes and gives up — WCAG 2.2, Redundant Entry.

#### Examples

```pseudo title="Avoid"
component BillingStep({ order })
  return Stack(
    TextField(label: "Billing street", name: "street", purpose: StreetAddress),
    TextField(label: "Billing postal code", name: "postalCode", purpose: PostalCode)
  )
```

```pseudo title="Prefer"
component BillingStep({ order })
  let [isSameAsDelivery, setIsSameAsDelivery] = state(true)

  return Stack(
    Checkbox(
      label: "Bill to my delivery address",
      isChecked: isSameAsDelivery,
      onChange: setIsSameAsDelivery
    ),
    if not isSameAsDelivery then
      AddressFields(initialValue: order.deliveryAddress)
  )
```

## Validation

### field-first-validated-when-left · SHOULD

Every field is first validated when it is left or its form is submitted, never while it is first typed in.

#### Why

A person told off while still typing learns to ignore the message.

#### Examples

```pseudo title="Avoid"
TextField(
  label: "Email",
  name: "email",
  kind: Email,
  onChange: function(value)
    setError(checkField(signUpSchema, "email", value))
)
```

```pseudo title="Prefer"
TextField(
  label: "Email",
  name: "email",
  kind: Email,
  onLeave: function(value)
    setError(checkField(signUpSchema, "email", value)),
  onChange: function(value)
    if error is not <absent> then
      setError(checkField(signUpSchema, "email", value))
)
```

### field-revalidated-as-fixed · SHOULD

Every field that shows an error is validated on every input, so the error clears as soon as the value is right.

#### Why

A person whose error stays after the fix does not know it is fixed, and fixes it again.

#### Examples

```pseudo title="Avoid"
TextField(
  label: "Email",
  name: "email",
  kind: Email,
  onLeave: function(value)
    setError(checkField(signUpSchema, "email", value))
)
```

```pseudo title="Prefer"
TextField(
  label: "Email",
  name: "email",
  kind: Email,
  onLeave: function(value)
    setError(checkField(signUpSchema, "email", value)),
  onChange: function(value)
    if error is not <absent> then
      setError(checkField(signUpSchema, "email", value))
)
```

### form-validated-by-its-own-schema · MUST

Every form checks its fields and shapes what it sends by one schema of its own.

#### Why

A form checked by other rules than those that shape what it sends lets through input the send then refuses, or refuses input the send would take.

#### Examples

```pseudo title="Avoid"
function onSubmit(values)
  if not values.email.contains("@") then
    return showFieldError("email", "Enter an email like ana@example.com")

  call signUp(parseSignUpInput(values))
```

```pseudo title="Prefer"
let MIN_PASSWORD_LENGTH = 8

let signUpForm = schema({
  email: Email(message: "Enter an email like ana@example.com"),
  password: Text(minLength: MIN_PASSWORD_LENGTH, message: "Use at least 8 characters")
})

function onSubmit(values)
  let parsed = signUpForm.parse(values)

  when parsed
    is Invalid then showFieldErrors(parsed.problems)
    is Valid then call signUp(parsed.value)
```

### field-error-says-how-to-fix → failure-shown-as-what-happened-and-what-next · MUST

Every field's error says what is wrong and how to put it right, such as the format expected or the range allowed. Exempt: a hint that would weaken security or defeat the purpose of the field, such as which part of a sign-in was wrong or the answer to a test's question.

#### Why

An error that only says the value is invalid leaves the person guessing until they give up — WCAG 2.2, Error Suggestion.

#### Examples

```pseudo title="Avoid"
let lineForm = schema({
  quantity: Integer(min: 1, max: 99, message: "Invalid quantity"),
  giftEmail: Email(message: "Invalid email")
})
```

```pseudo title="Prefer"
let MAX_LINE_QUANTITY = 99

let lineForm = schema({
  quantity: Integer(min: 1, max: MAX_LINE_QUANTITY, message: "Enter a quantity from 1 to 99"),
  giftEmail: Email(message: "Enter an email like ana@example.com")
})
```

### invalid-field-tells-its-error · MUST

Every invalid field tells assistive technology that it is invalid and which text describes its error.

#### Why

A person who cannot see the field's mark or the error text beside it hears the field announced as valid, and cannot find what to fix — WCAG 2.2, Error Identification.

#### Examples

```pseudo title="Avoid"
component EmailField({ error })
  return Stack(
    TextField(label: "Email", name: "email", kind: Email),
    if error is not <absent> then ErrorText(text: error)
  )
```

```pseudo title="Prefer"
let EMAIL_ERROR_ID = "email-error"

component EmailField({ error })
  return Stack(
    TextField(
      label: "Email",
      name: "email",
      kind: Email,
      isInvalid: error is not <absent>,
      describedBy: EMAIL_ERROR_ID
    ),
    if error is not <absent> then ErrorText(id: EMAIL_ERROR_ID, text: error)
  )
```

### failed-submit-focuses-the-first-error · MUST

Every failed submit moves focus to the first invalid field, or to a summary that links to each.

#### Why

A failed submit that leaves focus where it was leaves the person hunting the form for what to fix.

#### Examples

```pseudo title="Avoid"
function onSubmit(values)
  let parsed = checkoutForm.parse(values)

  when parsed
    is Invalid then showFieldErrors(parsed.problems)
    is Valid then call placeOrder(parsed.value)
```

```pseudo title="Prefer"
function onSubmit(values)
  let parsed = checkoutForm.parse(values)

  when parsed
    is Invalid then
      showFieldErrors(parsed.problems)
      focusField(parsed.problems.first.field)
    is Valid then call placeOrder(parsed.value)
```

## Submission

### submit-never-disabled-by-an-invalid-form · SHOULD

Every submit control pressed on an invalid form answers with the form's errors, never by being disabled before it is pressed.

#### Why

A disabled submit tells nobody what is missing, and a person left facing it cannot find which field holds them back.

#### Examples

```pseudo title="Avoid"
component CheckoutForm({ form })
  return Form(
    onSubmit: form.submit,
    AddressFields(),
    SubmitButton(label: "Place order", isDisabled: not form.isValid)
  )
```

```pseudo title="Prefer"
component CheckoutForm({ form })
  return Form(
    onSubmit: form.submit,
    AddressFields(),
    SubmitButton(label: "Place order")
  )
```

### form-submits-once · MUST

Every form ignores a repeated submit while one is in flight.

#### Why

A second submit sends the order twice, or races the first and shows the result of neither.

#### Examples

```pseudo title="Avoid"
function onSubmit(order)
  call placeOrder(order)
```

```pseudo title="Prefer"
let [isSubmitting, setIsSubmitting] = state(false)

function onSubmit(order)
  if isSubmitting then
    return

  setIsSubmitting(true)

  try
    call placeOrder(order)
  finally
    setIsSubmitting(false)
```

### submit-busy-keeps-its-focus · SHOULD

Every submit control keeps its focus while its form submits.

#### Why

A control taken out of reach while busy drops focus to the page, and the person must find their place again.

#### Examples

```pseudo title="Avoid"
SubmitButton(
  label: "Place order",
  busyLabel: "Placing order...",
  isBusy: form.isSubmitting,
  isDisabled: form.isSubmitting
)
```

```pseudo title="Prefer"
SubmitButton(
  label: "Place order",
  busyLabel: "Placing order...",
  isBusy: form.isSubmitting
)
```

### submit-shows-it-is-busy · SHOULD

Every submit control shows it is busy while its form submits, with a busy label.

#### Why

A control that says nothing while its form submits looks ignored, so the person presses it again or leaves.

#### Examples

```pseudo title="Avoid"
SubmitButton(label: "Place order")
```

```pseudo title="Prefer"
SubmitButton(
  label: "Place order",
  busyLabel: "Placing order...",
  isBusy: form.isSubmitting
)
```

## Unsaved input

### unsaved-input-guarded-on-leave · SHOULD

All input the person has not saved survives a navigation away: the screen asks before discarding it, or keeps it as a draft to return to.

#### Why

A tap on the wrong link otherwise throws away minutes of typing.

#### Examples

```pseudo title="Avoid"
component ReviewForm({ form })
  return Form(
    onSubmit: form.submit,
    TextArea(label: "Your review", name: "review"),
    SubmitButton(label: "Post review")
  )
```

```pseudo title="Prefer"
component ReviewForm({ form })
  guardLeave(
    shouldAsk: form.hasUnsavedChanges,
    question: "Discard your unsaved review?"
  )

  return Form(
    onSubmit: form.submit,
    TextArea(label: "Your review", name: "review"),
    SubmitButton(label: "Post review")
  )
```
