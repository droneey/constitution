# Security policy

> Governs the security policy of a public repository.

## Vocabulary

A repository's **security policy** is its document for whoever finds a vulnerability in it.

## General

### public-repository-states-security-policy · SHOULD

Every public repository carries a security policy at its root.

#### Why

A finder looks for the policy at the root before reporting, and one who finds no policy there reports in the open or not at all.

#### Examples

```text title="Avoid"
shop/
├── docs/
│   └── wiki-security-notes.md
├── LICENSE
└── README.md
```

```text title="Prefer"
shop/
├── docs/
├── LICENSE
├── README.md
└── SECURITY.md
```

### security-policy-states-the-supported-versions · SHOULD

Every public repository's security policy says which of its versions get security fixes.

#### Why

A finder who cannot tell whether a version gets a fix stops waiting and goes public before the fix ships.

#### Examples

```text title="Avoid"
SECURITY.md

## Reporting
Report a vulnerability through the
repository's private reporting.
```

```text title="Prefer"
SECURITY.md

## Supported versions
4.x   security fixes
3.x   security fixes until 2027-03-01
< 3   none

## Reporting
Report a vulnerability through the
repository's private reporting.
```

### security-policy-states-the-first-answer-time · SHOULD

Every public repository's security policy says how soon a report gets its first answer.

#### Why

A finder who does not know when to expect an answer takes silence for refusal and goes public before the fix ships.

#### Examples

```text title="Avoid"
SECURITY.md

## Reporting
Report a vulnerability through the
repository's private reporting.
We will get back to you.
```

```text title="Prefer"
SECURITY.md

## Reporting
Report a vulnerability through the
repository's private reporting.
You get a first answer within
3 working days.
```
