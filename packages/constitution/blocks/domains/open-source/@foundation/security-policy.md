# Security policy

> Governs the security policy of a public repository.

## Vocabulary

A repository's **security policy** is its document for whoever finds a vulnerability in it.

## General

### public-repository-states-security-policy · SHOULD

Every public repository carries a security policy at its root.

| Why |
|---|
| a finder looks for the policy at the root before reporting, and one who finds no policy there reports in the open or not at all. |

### security-policy-states-the-supported-versions · SHOULD

Every public repository's security policy says which of its versions get security fixes.

| Why |
|---|
| a finder who cannot tell whether a version gets a fix stops waiting and goes public before the fix ships. |

### security-policy-states-the-first-answer-time · SHOULD

Every public repository's security policy says how soon a report gets its first answer.

| Why |
|---|
| a finder who does not know when to expect an answer takes silence for refusal and goes public before the fix ships. |
