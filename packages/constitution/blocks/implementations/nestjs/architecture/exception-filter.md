# Exception filter

> Governs the one filter that maps the error kit's errors to answers.

## General

### error-kit-mapped-by-one-exception-filter → one-error-handler-registered-by-the-root · MUST

The handler is one exception filter whose `@Catch()` names no class, registered globally by the root; no controller or method binds a filter of its own with `@UseFilters`.

| Why |
|---|
| a filter that names no class receives every exception, the `NotFoundException` of an unknown route and the `BadRequestException` of a malformed body included, while a filter bound to one controller answers its failures in a second shape. |
