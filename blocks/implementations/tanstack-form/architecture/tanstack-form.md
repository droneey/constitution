# TanStack Form

## form-state-in-the-form-instance → one-home-per-datum
Values, errors, touched and submitting state live in the form instance, with no state per field beside it.

| Why | Check | Tags |
|---|---|---|
| one home for a form's state keeps validation, submission and display in agreement. | review | [] |

## form-submits-through-a-binding-unit → delivery-units-stay-thin
Submission calls the command's binding unit or an `on<Event>` callback; the form does no input or output.

| Why | Check | Tags |
|---|---|---|
| the form stays presentational, and serves whichever operation it is handed. | review | [] |
