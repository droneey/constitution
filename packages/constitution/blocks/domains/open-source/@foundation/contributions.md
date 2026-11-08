# Contributions

> Governs the guide and the code of conduct of a public repository that accepts contributions.

## Vocabulary

A public repository **accepts contributions** when it invites changes from people outside its project; a readme that says it takes none withdraws the invitation.

## General

### public-repository-carries-a-contribution-guide · SHOULD

Every public repository that accepts contributions carries a contribution guide. It says how to set the project up, check a change and propose it.

#### Why

A contributor who must guess the steps sends a change that fails review for reasons nobody wrote down.

#### Examples

```text title="Avoid"
shop/
├── LICENSE
├── README.md          "Pull requests welcome!"
└── src/
```

```text title="Prefer"
shop/
├── CONTRIBUTING.md    set up, run the check,
│                      open a pull request
├── LICENSE
├── README.md
└── src/
```

### public-repository-carries-a-code-of-conduct · SHOULD

Every public repository that accepts contributions carries a code of conduct of an adopted standard, such as the Contributor Covenant.

#### Why

Without stated rules a harassed contributor cannot point to what was broken, and leaves.

#### Examples

```text title="Avoid"
shop/
├── CONTRIBUTING.md
├── LICENSE
├── README.md          "Be nice."
└── src/
```

```text title="Prefer"
shop/
├── CODE_OF_CONDUCT.md   Contributor Covenant 2.1
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── src/
```

### code-of-conduct-names-a-contact · SHOULD

Every public repository's code of conduct names a contact for reports.

#### Why

Without a contact a harassed contributor has nowhere to turn, and the rules go unenforced.

#### Examples

```text title="Avoid"
CODE_OF_CONDUCT.md

## Enforcement
Report unacceptable behaviour to the
community leaders.
```

```text title="Prefer"
CODE_OF_CONDUCT.md

## Enforcement
Report unacceptable behaviour to
conduct@shop.example, read by two
maintainers and no one else.
```
