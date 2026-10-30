# Forms

> Governs where a form's libraries are imported and where its checks come from.

## General

### form-library-imported-by-the-ui → layer-imports-dependencies-by-its-role · MUST

The form library has its home past the edge in the components and widgets of an interface's presentation, where a form is built.

| Why |
|---|
| a form is presentation that holds its own state, and the binding unit it submits through needs nothing of the library. |

### form-reuses-domain-predicates → value-object-checks-what-the-domain-relies-on · MUST

A form's schema sits with the form and composes the checks of the value objects it fills.

| Why |
|---|
| the form's checks are read beside the form they guard, and change with the value objects' checks they compose. |
