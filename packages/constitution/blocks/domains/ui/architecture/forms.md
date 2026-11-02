# Forms

> Governs where a form's checks come from.

## General

### form-schema-composes-value-object-checks → value-object-checks-what-the-domain-relies-on · MUST

A form's schema sits with the form and composes the checks of the value objects it fills; it never restates an invariant.

| Why |
|---|
| a schema kept away from its form is missed by the reader of the form, and one that restates the value objects' checks drifts from them. |
