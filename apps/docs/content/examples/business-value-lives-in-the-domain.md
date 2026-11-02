```pseudo title="Avoid"
# users/presentation/bindings/commands/sign-up
function onSignUp(request, signUp, context)
  let text = request.body.email

  if not text.contains("@") then
    return badRequest(InvalidEmailError)

  call signUp({ email: text }, context)
```

```pseudo title="Prefer"
# users/domain/user/value-objects/email.value-object
type Email = { address: String }

function create(text)
  if not text.contains("@") then
    throw new InvalidEmailError()

  return { address: text }

# users/application/use-cases/commands/sign-up
function parseSignUpInput(body)
  return { email: Email.create(body.email) }

# users/presentation/bindings/commands/sign-up
function onSignUp(request, signUp, context)
  let input = parseSignUpInput(request.body)

  call signUp(input, context)
```
