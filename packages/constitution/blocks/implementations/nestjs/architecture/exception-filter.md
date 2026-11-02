# Exception filter

> Governs the one filter that maps the errors of the program's error library to answers.

## General

### every-failure-mapped-by-one-exception-filter → one-error-handler-registered-by-the-root · MUST

One exception filter maps every failure. The handler is a filter whose `@Catch()` names no class, an interface-wide unit that the root's module registers globally as `APP_FILTER`; no controller or method binds a filter of its own with `@UseFilters`.

| Why |
|---|
| a filter that names no class receives every exception, the `NotFoundException` of an unknown route and the `BadRequestException` of a malformed body included, while a filter bound to one controller answers its failures in a second shape, and one kept among the root's files maps failures where no case proves it. |
