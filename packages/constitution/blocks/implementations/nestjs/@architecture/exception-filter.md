# Exception filter

> Governs the one filter that maps the errors of the program's error library to answers.

## General

### every-failure-mapped-by-one-exception-filter → one-error-handler-registered-by-the-root · MUST

One exception filter maps every failure. It is a filter whose `@Catch()` names no class, an interface-wide unit that the root's module registers globally as `APP_FILTER`.

| Why |
|---|
| a filter that names no class receives every exception, the `NotFoundException` of an unknown route and the `BadRequestException` of a malformed body included, and one kept among the root's files maps failures where no case proves it. |

### use-filters-never-written → operation-never-answers-its-own-failure · MUST

No controller or method binds a filter of its own with `@UseFilters`.

| Why |
|---|
| a filter bound to one controller answers its failures in a second shape, apart from the one filter every other failure reaches. |
