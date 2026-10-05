# Convergence

## The document

## section-optional-fields-required → absence-has-one-value
A section may be absent, and is then left untouched. Inside a declared section every managed field is stated: "there is none" is written, and mapped to absence when the document is read; a switched-off option carries nothing else.

| Why | Check | Tags |
|---|---|---|
| a field the program fills in by default is a decision the user never saw; stating every field makes the document the whole truth. | test | [] |

## secrets-are-references · MUST
A secret in the document is a reference by name to the environment. Validation lists every name the document needs, read from the environment or the local environment file beside the document, and fails on a missing one; the program reads no other name except those describing its host.

| Why | Check | Tags |
|---|---|---|
| the document can then be shared and reviewed, and a missing secret fails before anything is applied. | review | [security] |

## document-variants-selected-by-a-discriminant → illegal-states-unrepresentable
A section of the document that takes several forms is a union selected by a discriminant field.

| Why | Check | Tags |
|---|---|---|
| each form is then checked by its own schema, and a wrong one fails before anything runs, with a message that names the field. | test | [data, errors] |

## one-syntax-per-value-kind · SHOULD
Each kind of value — a size, a duration — has one syntax in the document, parsed once.

| Why | Check | Tags |
|---|---|---|
| a user learns one way to write a size, and the program never guesses which one was meant. | review | [data] |

## published-schema-generated-from-code · MUST
The schema published for editors is generated from the code's schema, never written by hand. The check compares the copy kept in the repository with it and never rewrites it.

| Why | Check | Tags |
|---|---|---|
| a schema written twice drifts, and editors then accept documents the program rejects. | test | [data] |

## document-points-editors-at-the-schema · SHOULD
The document points editors at the published schema.

| Why | Check | Tags |
|---|---|---|
| the editor then checks and completes the document as it is written. | review | [ux] |

## The stages

## plan-names-destroying-changes → irreversible-operations-behind-flag-and-human
The plan names every change that destroys something, and apply refuses one without an explicit flag.

| Why | Check | Tags |
|---|---|---|
| a destroyed resource cannot be converged back; the user must see it and ask for it. | test | [] |

## second-run-changes-nothing → operations-idempotent-by-design · MUST
Applying the same document twice reports no change the second time, and a test proves it.

| Why | Check | Tags |
|---|---|---|
| convergence is safe to rerun only if it is idempotent, and only a test keeps it so. | test | [testing] |

## run-reports-per-stage · SHOULD
A run reports each stage as skipped with its reason, unchanged, changed, ran or failed.

| Why | Check | Tags |
|---|---|---|
| the user sees what happened to each part, and where a failed run stopped. | review | [ux, errors] |

## run-output-in-one-work-folder · SHOULD
What a run produces lands in one work folder, apart from the document.

| Why | Check | Tags |
|---|---|---|
| rendered files and state never mix with the document, and one folder is cleared or ignored as a whole. | review | [] |

## Engines

## engines-downloaded-per-release-not-vendored · MUST
Engines the program drives are not vendored: each is downloaded per release into the program's home.

| Why | Check | Tags |
|---|---|---|
| a vendored engine grows the repository with every release, while a download per release keeps every machine on the engine the release names. | review | [] |

## developer-and-ci-run-the-tools-engines · SHOULD
Developers and CI run exactly the engines the program installed, linked into one directory of its home.

| Why | Check | Tags |
|---|---|---|
| a developer testing against another engine version tests another program. | review | [] |

## Requirements for implementation

What any schema library a convergence program uses must provide.

## schema-rejects-unknown-keys · MUST
The library offers strict objects that fail on an unknown key.

| Why | Check | Tags |
|---|---|---|
| without it, a misspelt key is silently ignored and the document says something the program never reads. | review | [data] |

## schema-discriminated-unions · MUST
The library offers unions selected by a discriminant field, with an error that names it.

| Why | Check | Tags |
|---|---|---|
| a section's variants are then validated by their own schema, and a wrong one is reported as such. | review | [data, errors] |

## schema-exports-json-schema · MUST
The library generates a JSON Schema from the code's schema.

| Why | Check | Tags |
|---|---|---|
| the schema editors read must come from the code, or it drifts. | review | [data] |
