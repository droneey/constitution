# Forms

> Governs where a form's checks come from.

## General

### form-reuses-domain-predicates → business-value-lives-in-the-domain · MUST

A form's schema composes the checks of the domain's value objects and sits with the form; it never restates an invariant.

| Why |
|---|
| a rule checked in two places drifts, and the form then accepts what the domain rejects. |
