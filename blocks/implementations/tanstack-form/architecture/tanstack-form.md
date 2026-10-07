# TanStack Form

### form-submits-through-a-binding-unit → components-dumb-widgets-smart · MUST
Submission calls the command's binding unit or an `on<Event>` callback; the form does no input or output.

| Why | Tags |
|---|---|
| the form stays presentational, and serves whichever operation it is handed. | [] |

### form-library-imported-by-the-ui → layer-imports-dependencies-by-its-role · MUST
The form library's home reaches past the edge into a UI's components and widgets, where a form is built.

| Why | Tags |
|---|---|
| a form is presentation that holds its own state, and the binding unit it submits through needs nothing of the library. | [] |
