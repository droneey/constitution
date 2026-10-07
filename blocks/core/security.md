# Security

> Governs secrets, credentials, cryptography, and outside input: its size, its matching, and where it is run, rebuilt or followed.

## Secrets

### secret-never-in-the-repository · MUST
A secret is never written into the repository — not in code, documents, tests or fixtures.

| Why | Tags |
|---|---|
| a secret in the repository is readable by everyone who can read it, and by every copy made of it. | [security] |

### secret-and-personal-data-kept-out-of-output · MUST
A secret or a piece of personal data never appears in a log, an error, a URL, a build artefact, test data or a document; an error that reaches anyone but the data’s owner carries identifiers, never the values it rejected. An audit record kept for security holds the identifier and the address its event needs, and nothing more.

| Why | Tags |
|---|---|
| output is copied to places with weaker access than the data it came from, and a URL is logged by every proxy and browser it passes; a security audit needs to know who acted and from where, and no more. | [security, data] |

### leaked-secret-rotated-at-once · MUST
A secret that leaked — into the repository, a log, a message — is rotated at once, and the access made with it while it was exposed is checked.

| Why | Tags |
|---|---|
| a leaked secret is compromised whether or not the leak is undone, and only its access log says whether it was used. | [security] |

### credential-has-least-privilege · SHOULD
A credential belongs to one identity and one purpose per environment, with only the permissions its job needs, documented beside its use, and short-lived where the platform issues such; access is granted to people and services, never through a shared credential.

| Why | Tags |
|---|---|
| a narrow, short-lived credential limits what a leak can do, and one identity per credential says who did what. | [security] |

## Input from outside

### outside-input-bounded-before-it-is-parsed · MUST
Input a sender outside the program controls — a body, a file, a message — is refused past a size before it is read whole, and past a depth of nesting while it is parsed.

| Why | Tags |
|---|---|
| a parser handed an input of any size or depth spends memory and time the sender chooses. | [security, performance] |

### outside-input-matched-in-linear-time · MUST
A pattern matched against outside input runs in time linear in its length: a regular-expression engine that never backtracks, or a pattern with no nested or overlapping repetition.

| Why | Tags |
|---|---|
| a backtracking pattern turns one crafted string into minutes of work, and one request takes the program down. | [security, performance] |

### outside-input-reaches-interpreters-as-parameters · MUST
Input from outside — a model’s output included — reaches a query, a shell command, a file path, markup or a template only through that interpreter’s parameters or its encoder, and a path is resolved and confined to its root before it is used.

| Why | Tags |
|---|---|
| text joined into code lets whoever wrote the text write the code. | [security] |

### outside-input-never-rebuilt-as-objects · MUST
Input from outside is never read by a format that can build arbitrary objects or run code.

| Why | Tags |
|---|---|
| such a format runs whatever its sender put in it. | [security] |

### outside-address-followed-only-from-an-allowlist · MUST
An address or an origin from outside the program — a redirect target, the origin of a message, a host a caller names — is followed, trusted or reached only when it is on an allowlist of the program’s own, or, to reach a host whose names cannot be known in advance, only when the address it resolves to as the connection opens is public.

| Why | Tags |
|---|---|
| whoever chooses the address chooses where the program sends its user, whom it believes, or what it reaches on their behalf. | [security] |

### security-check-fails-closed · MUST
A check that guards access or trust — a signature, an allowlist, a token, a lookup of rights — refuses when it cannot decide: a failure, a timeout or a missing setting denies.

| Why | Tags |
|---|---|
| an attacker who can make the check fail otherwise passes it, and a missing setting that allows opens the door on the first misconfigured deployment. | [security] |

## Primitives

### cryptographic-algorithm-approved-by-current-guidance · MUST
A cryptographic algorithm, mode and key size are ones current guidance approves — NIST's or OWASP ASVS's lists — and one the guidance deprecates is never chosen for new data.

| Why | Tags |
|---|---|
| a vetted library still offers broken algorithms, and data protected by one is open to whoever reads it later. | [security] |

### security-primitive-from-a-vetted-library · MUST
A security primitive comes from the platform or a vetted library: a token, a nonce or an identifier that guards access from a cryptographic random source, a password stored only by a password-hashing function, a secret compared in constant time; the project writes no cryptography of its own.

| Why | Tags |
|---|---|
| a home-made primitive fails silently, and an attacker finds it first. | [security] |
