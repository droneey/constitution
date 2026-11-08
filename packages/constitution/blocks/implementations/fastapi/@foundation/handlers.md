# Handlers

> Governs a handler: its dependencies and its parameters.

## General

### dependencies-declared-in-annotated · MUST

Every source of a handler's or a dependency's parameter, a dependency included, is declared in `Annotated[...]`, never as a default value. Their markers, such as `Depends`, `Query`, `Path`, `Header` and `Body`, sit inside the annotation.

| Why |
|---|
| a source declared as a default value takes the place of the parameter's real default, and the function called outside FastAPI receives the `Depends` or `Query` object instead of a value. |

### path-parameters-read-by-the-handler · MUST

Every parameter of a route's path is a parameter of its handler or of a dependency the handler takes through `Depends`.

| Why |
|---|
| a path parameter neither the handler nor its dependency takes is parsed by nobody, and the route matches values the program never checks. |
