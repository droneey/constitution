```pseudo title="Avoid"
# users/app/sign-up
function signUpHandler(request)
  let text = request.email
  if not text.contains("@") then
    return badRequest(InvalidEmail)
  call signUp(text)
```

```pseudo title="Prefer"
# value-objects/email.value-object
type Email = { address: String }
function parseEmail(text)
  if not text.contains("@") then
    return failure(InvalidEmail)
  return success({ address: text })

# users/app/sign-up
let email = parseEmail(request.email)
if email is InvalidEmail then
  return badRequest(InvalidEmail)
call signUp(email)
```
