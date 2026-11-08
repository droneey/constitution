# Contracts

> Governs a contract of import-linter.

## General

### contract-named-after-its-rule · SHOULD

Every contract's `name` is the slug of the rule it holds.

| Why |
|---|
| a contract named otherwise breaks with a name that says nothing of why the import is refused, and its reader must find the rule it holds. |
