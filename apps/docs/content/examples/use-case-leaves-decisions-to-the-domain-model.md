```pseudo title="Avoid"
# users/application/use-cases/commands/rename-user
import UserNotFoundError from "../../../errors"

function createRenameUser({ userRepository })
  return function(input, context)
    let user = userRepository.find(input.userId, context)

    if user is nothing then
      throw new UserNotFoundError(input.userId)

    if userRepository.isNameTaken(input.name, context) then
      throw new NameTakenError(input.name)

    call userRepository.save(rename(user, input.name), context)
```

```pseudo title="Prefer"
# users/application/use-cases/commands/rename-user
import UserNotFoundError from "../../../errors"

function createRenameUser({ userRepository })
  return function(input, context)
    let user = userRepository.find(input.userId, context)

    if user is nothing then
      throw new UserNotFoundError(input.userId)

    let isNameTaken = userRepository.isNameTaken(input.name, context)

    call userRepository.save(rename(user, input.name, isNameTaken), context)

# users/application/errors/user-not-found.error
type UserNotFoundError = { code: "user-not-found", userId: UserId }

# users/domain/user/transitions/user.transitions
function rename(user, name, isNameTaken)
  if isNameTaken then
    throw new NameTakenError(name)

  return { ...user, name }
```
