# TanStack Form

## form-submits-through-a-binding-unit → components-dumb-widgets-smart
Submission calls the command's binding unit or an `on<Event>` callback; the form does no input or output.

| Why | Check | Tags |
|---|---|---|
| the form stays presentational, and serves whichever operation it is handed. | review | [] |

## form-library-imported-by-the-ui → packages-imported-by-folder-role
The form library's home reaches past the edge into a UI's components and widgets, where a form is built.

| Why | Check | Tags |
|---|---|---|
| a form is presentation that holds its own state, and the binding unit it submits through needs nothing of the library. | tool/imports | [] |
