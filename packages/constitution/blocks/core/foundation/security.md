# Security

> Governs secrets, credentials, cryptography, outside input — its size, its matching, the work done on it, and where it is run, rebuilt or followed — and the vulnerabilities found in what was released.

## Secrets

### secret-never-in-the-repository · MUST

A secret is never written into the repository in a form that reveals it — in clear, or encrypted to a key the repository holds — not in code, documents, tests or fixtures.

| Why |
|---|
| a secret in the repository is readable by everyone who can read it, and by every copy made of it. |

### secret-kept-out-of-output · MUST

A secret never appears in a log, an error, a URL or a build artefact, save in a URL a token made for it — single-use or short-lived, as a reset link's or a signed address's.

| Why |
|---|
| output is copied to places with weaker access than the data it came from, and a URL is logged by every proxy and browser it passes. |

### secret-never-passed-as-a-process-argument · MUST

A secret is never passed to a process as a command-line argument; it reaches the process by a way no other user of the machine reads — standard input, a file only its user can read, an environment built for it, or a store the process reads itself.

| Why |
|---|
| a process's arguments are read by every user of the machine through its process listing, and are kept in shell histories and the logs of the tools that start it. |

### child-process-environment-built-for-it · MUST

A process the program starts receives an environment built for it, holding only what that child needs, never the program's whole environment; a script that only joins commands passes on the environment its caller built for them, each secret it received only to the command that reads it.

| Why |
|---|
| a child inherits every variable by default, a secret among them, and passes it on to its own children and into what it prints. |

### leaked-secret-rotated-at-once · MUST

A secret that leaked — into the repository, a log, a message — is rotated at once, and the access made with it while it was exposed is checked.

| Why |
|---|
| a leaked secret is compromised whether or not the leak is undone, and only its access log says whether it was used. |

### credential-has-least-privilege · MUST

A credential belongs to one identity and one purpose per environment, with only the permissions its job needs; access is granted to people and services, never through a shared credential.

| Why |
|---|
| a credential with only the permissions its job needs limits what a leak can do, and one identity per credential says who did what. |

### credential-short-lived · SHOULD

A credential is short-lived where the platform issues such.

| Why |
|---|
| a credential that lives long stays useful to whoever takes it. |

### process-runs-with-only-the-rights-its-job-needs · MUST

A program runs as a user with only the operating-system rights and the file access its job needs.

| Why |
|---|
| one flaw that runs code in a process with more rights than its job needs reaches everything those rights reach. |

## Input from outside

### outside-input-bounded-before-it-is-parsed · MUST

Input a sender outside the program controls — a body, a file, a message — is refused past a size before it is read whole, past a size after it is decoded or decompressed, and past a depth of nesting while it is parsed.

| Why |
|---|
| a parser handed an input of any size or depth spends memory and time the sender chooses. |

### outside-input-matched-in-linear-time · MUST

A pattern matched against outside input runs in time linear in its length: a regular-expression engine that never backtracks, or a pattern with no nested or overlapping repetition.

| Why |
|---|
| a backtracking pattern turns one crafted string into minutes of work, and one request takes the program down. |

### work-on-outside-sized-input-grows-at-most-n-log-n · MUST

Work over input whose size someone outside the program chooses — a client, a file, a remote system — grows no faster than n log n in time and n in memory; an algorithm that grows faster runs only on a count the program caps low enough for that growth, and the code names the cap beside it.

| Why |
|---|
| a nested loop over a list a client sends is instant on test data and takes the program down on a large one, the same denial a backtracking pattern causes. |

### outside-input-reaches-interpreters-as-parameters · MUST

Input from outside — a model’s output included — reaches a query, a shell command, markup, a template or a log line only through that interpreter’s parameters or its encoder — or, where the input is itself markup to render, a sanitiser that keeps only the elements, attributes and schemes allowed.

| Why |
|---|
| text joined into code lets whoever wrote the text write the code. |

### outside-path-confined-to-its-root · MUST

A path built from outside input is used only after its real path, every link followed, is confirmed to lie inside the root it is meant for; where another writer can change the tree between the check and the use, the file is opened beneath the root by the platform's confined open, or the check is made on the file once opened.

| Why |
|---|
| a `..` or an absolute path in a name reaches any file the program may read or write. |

### outside-identifier-normalised-before-comparison · MUST

An identifier from outside that grants or refuses access — a user name, an e-mail address, a host name — is normalised to one form before it is compared, stored or checked against a list.

| Why |
|---|
| two spellings of one identifier — another case, another Unicode form, a trailing dot — pass a check made on one and reach what the other guards. |

### outside-input-never-rebuilt-as-objects · MUST

Input from outside is never read by a format that can build arbitrary objects or run code.

| Why |
|---|
| such a format runs whatever its sender put in it. |

### outside-input-parsed-without-external-references · MUST

A parser of outside input resolves no external reference the input names — an XML entity or document type, an include, a remote `$ref` — save from a list the program fixes.

| Why |
|---|
| a reference inside the input makes the parser read a file or call an address the sender chose, on the program's behalf. |

### outside-address-followed-only-from-an-allowlist · MUST

An address or an origin from outside the program — a redirect target, the origin of a message, a host a caller names — is followed, trusted or reached only when it is on an allowlist of the program’s own, or, to reach a host whose names cannot be known in advance, only when the address it resolves to as the connection opens is public.

| Why |
|---|
| whoever chooses the address chooses where the program sends its user, whom it believes, or what it reaches on their behalf. |

### security-check-fails-closed · MUST

A check that guards access or trust — a signature, an allowlist, a token, a lookup of rights — refuses when it cannot decide: a failure, a timeout or a missing setting denies.

| Why |
|---|
| an attacker who can make the check fail otherwise passes it, and a missing setting that allows opens the door on the first misconfigured deployment. |

## Primitives

### cryptographic-algorithm-approved-by-current-guidance · MUST

A cryptographic algorithm, mode and key size are ones current guidance approves — NIST's or OWASP ASVS's lists —, one the guidance deprecates is never chosen for new data, and a key agreement the program sets up uses a hybrid exchange with a post-quantum algorithm, such as X25519MLKEM768, wherever both sides support one.

| Why |
|---|
| a vetted library still offers broken algorithms, and data protected by one, or traffic recorded today under a classical exchange, is open to whoever reads it later. |

### security-primitive-from-a-vetted-library · MUST

A security primitive comes from the platform or a vetted library: a token, a nonce or an identifier that guards access from a cryptographic random source, a password stored only by a password-hashing function, a secret compared in constant time; the project writes no cryptography of its own.

| Why |
|---|
| a home-made primitive fails silently, and an attacker finds it first. |

## Vulnerabilities

### vulnerability-reported-privately · MUST

A program released to others names, where its users and finders look — its readme, its manifest, its site — where a vulnerability in it is reported privately.

| Why |
|---|
| a finder with no private channel reports in public, and the users learn last; the EU's Cyber Resilience Act asks every product with digital elements for that contact. |

### exploited-vulnerability-and-severe-incident-reported-in-time · MUST

An actively exploited vulnerability in a released version, and a severe incident that affects its security, are reported to the authority within the times the law that binds the product sets — under the EU Cyber Resilience Act an early warning within 24 hours, a notification within 72 — and the users it reaches are told of it and of what to do.

| Why |
|---|
| the deadline runs from when the maker learns of it, a report late is a breach of its own, and the law binds an application from a store as much as a package from a registry. |
