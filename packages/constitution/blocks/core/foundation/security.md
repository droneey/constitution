# Security

> Governs secrets, access, the connections the program opens, cryptography, outside input — its size, its matching, the work done on it, and where it is run, rebuilt or followed — and the vulnerabilities found in what was released.

## Secrets

### secret-never-in-the-repository · MUST

A secret is never written into the repository in a form that reveals it. It is written there neither in clear nor encrypted to a key the repository holds — not in code, documents, tests or fixtures.

| Why |
|---|
| a secret in the repository is readable by everyone who can read it, and by every copy made of it. |

### secret-kept-out-of-output · MUST

A secret never appears in what the program outputs. Such output includes a log, an error, an answer, a URL, a crash report and a build artefact; the one answer whose purpose is to hand a new secret to its owner shows it once, and a URL may carry a token made for it — single-use or short-lived, as a reset link's or a signed address's.

| Why |
|---|
| output is copied to places with weaker access than the data it came from, and a URL is logged by every proxy and browser it passes. |

### secret-never-passed-as-a-process-argument · MUST

A secret is never passed to a process as a command-line argument. It reaches the process by a way no other user of the machine reads — standard input, a file only its user can read, an environment built for it, or a secret store the process reads itself.

| Why |
|---|
| a process's arguments are read by every user of the machine through its process listing, and are kept in shell histories and the logs of the tools that start it. |

### child-process-environment-built-for-it · MUST

A process the program starts receives an environment built for it. That environment holds only what the child needs, never the program's whole environment; a script that only joins commands passes on the environment its caller built for them, each secret it received only to the command that reads it.

| Why |
|---|
| a child inherits every variable by default, a secret among them, and passes it on to its own children and into what it prints — least privilege. |

### leaked-secret-rotated-at-once · MUST

A leaked secret is rotated at once. That holds wherever it leaked — into the repository, a log, a message —, and the access made with it while it was exposed is checked.

| Why |
|---|
| a leaked secret is compromised whether or not the leak is undone, and only its access log says whether it was used. |

## Access

### credential-has-least-privilege · MUST

A credential has only the permissions its job needs. It belongs to one identity and one purpose per environment, and access is granted to people and services, never through a shared credential.

| Why |
|---|
| a credential with more permissions than its job lets whoever takes it use all of them, and one shared between identities leaves no trace of who acted — least privilege. |

### credential-short-lived · SHOULD

A credential is short-lived where the platform issues such.

| Why |
|---|
| a credential that lives long stays useful to whoever takes it. |

### process-runs-with-only-the-rights-its-job-needs · MUST

A program runs as a user with only the operating-system rights and the file access its job needs.

| Why |
|---|
| one flaw that runs code in a process with more rights than its job needs reaches everything those rights reach — least privilege. |

### security-check-fails-closed · MUST

A security check fails closed. Such a check guards access or trust — a signature, an allowlist, a token, a lookup of rights — and refuses when it cannot decide: a failure, a timeout or a missing setting denies.

| Why |
|---|
| an attacker who can make the check fail otherwise passes it, and a missing setting that allows opens the door on the first misconfigured deployment — fail-safe defaults. |

## Input from outside

### outside-input-bounded-before-it-is-parsed · MUST

Input from outside is bounded before it is parsed. Input a sender outside the program controls — a body, a file, a message — is refused past a size before it is read whole, past a size after it is decoded or decompressed, and past a depth of nesting while it is parsed.

| Why |
|---|
| a parser handed an input of any size or depth spends memory and time the sender chooses. |

### outside-input-matched-in-linear-time · MUST

A pattern matched against outside input runs in time linear in its length. The pattern runs on a regular-expression engine that never backtracks, or has no nested or overlapping repetition.

| Why |
|---|
| a backtracking pattern turns one crafted string into minutes of work, and one request takes the program down. |

### work-on-outside-sized-input-grows-at-most-n-log-n · MUST

Work over input whose size an outsider chooses grows no faster than n log n in time and n in memory. The size is chosen by someone outside the program — a sender, a file, a remote system; an algorithm that grows faster runs only on a count the program caps low enough for that growth, and the code names the cap beside it.

| Why |
|---|
| a nested loop over a list a sender sends is instant on test data and takes the program down on a large one, the same denial a backtracking pattern causes. |

### outside-input-reaches-interpreters-as-parameters · MUST

Input from outside reaches an interpreter only as a parameter. Such input, a language model’s output included, reaches a query, a shell command, markup, a template or a log line only through that interpreter’s parameters or its encoder, or, where the input is itself markup to render, through a sanitiser that keeps only the elements, attributes and schemes allowed. A pattern — a regular expression, a glob — is never built from it: the input is only the text a pattern matches.

| Why |
|---|
| text joined into code lets whoever wrote the text write the code, and a pattern built from it matches what its writer chose, or backtracks for as long as they like. |

### outside-path-confined-to-its-root · MUST

A path built from outside input stays inside its root. It is used only after its real path, every link followed, is confirmed to lie inside the root it is meant for; where another writer can change the tree between the check and the use, the file is opened beneath the root by the platform's confined open, or the check is made on the file once opened.

| Why |
|---|
| a `..` or an absolute path in a name reaches any file the program may read or write. |

### outside-identifier-normalised-before-comparison · MUST

An identifier from outside that grants or refuses access is normalised to one form before it is compared, stored or checked against a list. Such an identifier is a user name, an email address or a host name. The form is its Unicode NFKC form with its case folded — lower-cased where the language offers no full case fold —, save where the identifier's own standard fixes another, as IDNA does a host name's; an email address is folded whole, though its standard leaves the case of its local part to the mail host.

| Why |
|---|
| two spellings of one identifier (another case, another Unicode form, a trailing dot) pass a check made on one and reach what the other guards — Unicode Standard Annexes #15 and #31. |

### outside-input-never-rebuilt-as-objects · MUST

Input from outside is never read by a format that can build arbitrary objects or run code.

| Why |
|---|
| such a format runs whatever its sender put in it. |

### outside-input-parsed-without-external-references · MUST

A parser of outside input resolves no external reference the input names. Such a reference — an XML entity or document type, an include, a remote `$ref` — is resolved only from a list the program fixes.

| Why |
|---|
| a reference inside the input makes the parser read a file or call an address the sender chose, on the program's behalf. |

### outside-address-followed-only-from-an-allowlist · MUST

An address or an origin from outside is followed, trusted or reached only from an allowlist. Such an address is a redirect target, the origin of a message or a host a caller names; the allowlist is the program’s own, and a host whose names cannot be known in advance is reached instead only when the address it resolves to as the connection opens is public.

| Why |
|---|
| whoever chooses the address chooses where the program sends its user, whom it believes, or what it reaches on their behalf. |

## Connections

### network-connection-authenticated-and-encrypted · MUST

A connection the program opens across a network authenticates its peer and encrypts. This holds whether it reaches a store, a broker or another system. TLS is the common form of such a channel, and SSH and a Noise or WireGuard tunnel are such channels too; the channel is the program's own, or that of a proxy on its host that verifies for it, and it verifies the peer's identity and its name and never turns that verification off.

| Why |
|---|
| a connection inside a private network is still read by whoever reaches that network, and one that skips the peer's identity or its name trusts whoever answers and talks to whoever sits on its path — zero trust. |

## Cryptography

### cryptographic-algorithm-approved-by-current-guidance · MUST

Cryptography uses only what current guidance approves. Its algorithms, modes and key sizes are ones that guidance — NIST's or OWASP ASVS's lists — approves, and one the guidance deprecates is never chosen for new data.

| Why |
|---|
| a vetted library still offers broken algorithms, and data protected by one is open to whoever reads it later — NIST's guidance and OWASP ASVS. |

### key-agreement-hybrid-with-post-quantum · MUST

A key agreement uses a hybrid exchange with a post-quantum algorithm wherever both sides support one. That holds for every one the program sets up — a TLS connection, an encrypted channel, a sealed envelope.

| Why |
|---|
| traffic recorded today is decrypted once a quantum computer can break the classical exchange, which NIST deprecates by 2030, and the hybrid keeps the classical half's strength should the new algorithm fall — NIST's guidance. |

### security-primitive-from-a-vetted-library · MUST

A security primitive comes from the platform or a vetted library. A token, a nonce or an identifier that guards access comes from a cryptographic random source, a password is stored only by a password-hashing function, a secret is compared in constant time, and the project writes no cryptography of its own.

| Why |
|---|
| a home-made primitive fails silently, and an attacker finds it first. |

## Vulnerabilities

### vulnerability-reported-privately · MUST

A released program says where a vulnerability in it is reported privately. A program released to others names that place where its users and finders look — its readme, its manifest, its site.

| Why |
|---|
| a finder with no private channel reports in public, and the users learn last, and a product with digital elements that names no such contact breaks the EU's Cyber Resilience Act, which requires one. |

### exploited-vulnerability-and-severe-incident-reported-in-time · MUST

An exploited vulnerability or a severe incident is reported within the time the law sets. That holds for a vulnerability actively exploited in a released version and for an incident that affects its security; the law is the one that binds the product — under the EU Cyber Resilience Act an early warning within 24 hours, a notification within 72 —, the report goes to the authority, and the users it reaches are told of it and of what to do.

| Why |
|---|
| the deadline runs from when the maker learns of it, a report late is a breach of its own, and the Cyber Resilience Act binds a program from an app store as much as a package from a registry. |
