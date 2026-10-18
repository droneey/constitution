```pseudo title="Avoid"
type UserMongoDocument = {
  id: UserId,
  email: Email
}

function banUser(
  user: UserMongoDocument)
```

```pseudo title="Prefer"
type User = {
  id: UserId,
  email: Email
}

function banUser(
  user: User)
```
