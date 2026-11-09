---
id: schema/pydantic
summary: pydantic parses outside input into models.
requires: [python]
languages: []
governs: ["**/dtos/**", "**/infrastructure/**", "**/root/**", "**/presentation/**", "**/libs/**", "**/shared/**"]
---

# pydantic

> Pydantic, the package `pydantic`, parses what crosses the program's edge — a request, a response, a document, the environment — into models, and stays out of the domain: the business types inside are frozen dataclasses.

The package `pydantic-settings` reads the environment into one settings model, a `BaseSettings`, and a secret is typed `SecretStr`.
