```pseudo title="Avoid"
# libs/errors
class AppError extends Error
  constructor(message)
    super(message)
```

```pseudo title="Prefer"
# libs/errors
class AppError extends Error
  code: String
  details: Record<String, Value>

  constructor({ code, message, details, cause })
    super(message, { cause })

function isAppError(error, code)
  return error is AppError
    and error.code is code
```
