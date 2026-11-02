```pseudo title="Avoid"
# users/domain/user/value-objects/email.value-object
function create(text)
  if not text.contains("@") then
    throw new InvalidEmailError()

  if text.length > signUpFieldWidth then
    throw new EmailTooLongError()

  return { address: text }
```

```pseudo title="Prefer"
# users/domain/user/value-objects/email.value-object
function create(text)
  if not text.contains("@") then
    throw new InvalidEmailError()

  return { address: text }

# users/presentation/components/sign-up-form/sign-up-form.schema
let signUpFormSchema = schema({
  email: text().maxLength(signUpFieldWidth).check(Email.create)
})
```
