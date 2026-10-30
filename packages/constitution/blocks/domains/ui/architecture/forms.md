# Forms

> Governs where a form's libraries are imported and where its checks come from.

## General

### form-library-imported-by-the-ui → layer-imports-dependencies-by-its-role · MUST

The form library has its home past the edge in the components and widgets of an interface's presentation, where a form is built.

| Why |
|---|
| a form is presentation that holds its own state, and the binding unit it submits through needs nothing of the library. |

### form-reuses-domain-predicates → business-value-lives-in-the-domain · MUST

A form's schema composes the checks of the domain's value objects and sits with the form; it never restates an invariant.

| Why |
|---|
| a rule checked in two places drifts, and the form then accepts what the domain rejects. |
