# Security

> Governs secrets, access, outside input and cryptography.

## Vocabulary

A **secret** is a value whose reading grants access to something that outlives the run that reads it, such as a key, a token or a password; the password of an engine, as the tests chapter defines it, that a test starts and discards with its run is none.

A **credential** is a secret an identity presents to a system to gain access, a password the program presents included; a password the program verifies is one its users present to it.

**Outside input** is a value from outside, as the data chapter defines it, that a party other than the program controls, such as a request's body, an uploaded file, a message, or another program's output, a language model's or a scraped page's.

A **capped count** is a number of items the program caps low enough for the growth of the work over them, the cap named in the code beside that work.

## Secrets

### secret-never-in-the-repository · MUST

Every secret stays out of the repository in every form that reveals it. It is written there neither in clear nor encrypted to a key the repository holds, whether in code, documents, tests or fixtures.

| Why |
|---|
| a secret in the repository is readable by everyone who can read it, and by every copy made of it. |

### secret-kept-out-of-output · MUST

Every secret stays out of what the program outputs. Such output includes a log, an error, an answer, a URL, a crash report and an artefact, as the tests chapter defines it. Exempt: the one answer whose purpose is to hand a new secret to its owner, which shows it once, and a URL that carries a single-use or short-lived token made for it, such as a reset link's or a signed address's.

| Why |
|---|
| output is copied to places with weaker access than the data it came from, and a URL is logged by every proxy and browser it passes. |

### secret-never-passed-as-a-process-argument · MUST

Every secret reaches a process only by a way no other user of the machine reads, never as a command-line argument. Such ways are its standard input, a file only its user can read, environment variables built for it, and a secret store the process reads itself.

| Why |
|---|
| a process's arguments are read by every user of the machine through its process listing, and are kept in shell histories and the logs of the tools that start it. |

### child-process-variables-built-for-it · MUST

Every process the program starts receives environment variables built for it. They hold only what the child needs, never all of the program's own. Exempt: a script that only runs other programs, which passes on what its caller built for them, each secret it received only to the program that reads it.

| Why |
|---|
| a child inherits every variable by default, a secret among them, and passes it on to its own children and into what it prints — least privilege. |

### leaked-secret-rotated-at-once · MUST

Every leaked secret is rotated at once, wherever it leaked, such as into the repository, a log or a message.

| Why |
|---|
| a leaked secret is compromised whether or not the leak is undone, and stays usable until it is rotated. |

### rotated-secret-read-again · MUST

While the program runs, every secret its host rotates is read again, through the name and type it was first read through.

| Why |
|---|
| a secret read once at start fails every call after its host rotates it. |

### leaked-secrets-access-checked · MUST

Every access made with a leaked secret while it was exposed is checked.

| Why |
|---|
| only the secret's access log says whether it was used, and an access nobody checked is a breach nobody answers. |

## Access

### credential-has-least-privilege · MUST

Every credential has only the permissions its job needs, for one purpose.

| Why |
|---|
| a credential with more permissions than its job lets whoever takes it use all of them — least privilege. |

### credential-serves-one-environment · MUST

Every credential serves one deployment environment, never two.

| Why |
|---|
| a credential shared between environments lets a leak from the least guarded one reach the data of every other, production's among them. |

### credential-never-shared · MUST

Every credential belongs to one identity. Access is granted to each person and each service through a credential of its own, never through a shared one.

| Why |
|---|
| a credential shared between identities leaves no trace of who acted, and revoking it from one takes it from all. |

### credential-short-lived · MUST

Where its platform issues short-lived credentials, every credential is short-lived.

| Why |
|---|
| a credential that lives long stays useful to whoever takes it. |

### process-runs-with-only-the-rights-its-job-needs · MUST

Every program runs as a user of its operating system with only the rights and the file access its job needs.

| Why |
|---|
| a flaw that runs code in a process with more rights than its job needs reaches everything those rights reach — least privilege. |

### temporary-file-named-unpredictably · MUST

Every temporary file or folder made where other users or runs can write takes a name none of them can predict.

| Why |
|---|
| a name another user can predict is taken first, by a link to a file the program then overwrites or by a file whose content it then trusts, and a name another run can predict is the one that run takes too, so the two write into one file — SEI CERT FIO21-C. |

### temporary-file-made-exclusively · MUST

Wherever other users or runs can write, every temporary file or folder is made exclusively: in one step that fails on a taken name.

| Why |
|---|
| a file opened at a name found free, not made there in one step, is one another user or run makes in the moment between, as a link to a file the program then overwrites — SEI CERT FIO21-C. |

### temporary-file-open-only-to-its-creator · MUST

Every temporary file or folder the program makes is open only to the user it runs as. No other user of its operating system can read or change it, from the moment it is made.

| Why |
|---|
| a temporary file another user can read hands them what the program wrote there, a secret among it, and one they can change feeds the program what they wrote, in the moment before its rights are narrowed as much as after. |

### security-check-fails-closed · MUST

Every security check fails closed. Such a check guards access or trust, such as a signature, an allowlist, a token or a lookup of rights, and refuses when it cannot decide: a failure, a timeout or a missing setting denies.

| Why |
|---|
| an attacker who can make the check fail otherwise passes it, and a missing setting that allows opens the door on the first misconfigured deployment — fail-safe defaults. |

## Outside input

### outside-input-bounded-before-it-is-parsed · MUST

All outside input is bounded in size before it is parsed, rejected past a size before it is read whole.

| Why |
|---|
| a parser handed input of any size spends memory and time the sender chooses. |

### decoded-input-bounded-before-it-is-parsed · MUST

All outside input that is decoded or decompressed is rejected once its decoded form passes a size, before it is parsed.

| Why |
|---|
| a small compressed body that expands without a bound spends memory the sender chooses, though its size on the wire passed every check. |

### outside-input-nesting-bounded-while-parsed · MUST

All outside input is rejected past a depth of nesting while it is parsed.

| Why |
|---|
| a parser handed nesting of any depth exhausts its stack or its memory on input small enough to pass every bound of size. |

### outside-input-matched-in-linear-time · MUST

Every pattern matched against outside input runs in time linear in the input's length. It runs on a matcher that never backtracks, or has no nested or overlapping repetition.

| Why |
|---|
| a backtracking pattern turns one crafted string into minutes of work, and one request takes the program down. |

### work-on-outside-sized-input-grows-at-most-n-log-n · MUST

All work over input whose size an outsider chooses grows no faster than n log n in time. Exempt: work over a capped count.

| Why |
|---|
| a nested loop over a list a sender sends is instant on test data, and a sender who sends a long one spends the program's time at will, denying it to every other user. |

### memory-for-outside-sized-input-grows-at-most-linearly · MUST

All work over input whose size an outsider chooses grows no faster than n in memory. Exempt: work over a capped count.

| Why |
|---|
| a structure that grows faster than its input lets a sender of a modest request exhaust the program's memory, and the program falls for every user. |

### outside-input-reaches-interpreters-as-parameters · MUST

All outside input reaches an interpreter only as its parameters or through its encoder. Interpreters include a store's query language, a shell, markup, a template and a log line. Exempt: input that is itself markup to render, which reaches it through a sanitiser that keeps only the elements, attributes and schemes allowed.

| Why |
|---|
| text joined into code lets whoever wrote the text write the code. |

### outside-operand-never-read-as-an-option · MUST

No outside input that code hands a program it starts as an operand is read as one of its options. Each such input follows that program's end-of-options marker, such as `--`; where the program has none, one that opens with its option prefix is refused or rewritten so that it does not, as a path is by a leading `./`.

| Why |
|---|
| a started program reads an operand that opens with its option prefix as an option, so an input written as an option, such as one that names a file to write or a command to run, makes the program do what the input's writer chose — argument injection (CWE-88). |

### pattern-never-built-from-outside-input · MUST

All outside input is only the text a pattern matches, never part of the pattern. Such patterns include a regular expression and a glob.

| Why |
|---|
| a pattern built from outside input matches what its writer chose, or backtracks for as long as they like. |

### outside-path-confined-to-its-root · MUST

Every path built from outside input stays inside its root. Where another writer can change the tree between a check and the use, the file is opened beneath the root by the platform's confined open, or checked once opened; elsewhere the path is used only once its real path, every link followed, is confirmed inside the root it is meant for.

| Why |
|---|
| a `..` or an absolute path in a name reaches any file the program may read or write — path traversal. |

### outside-address-followed-only-from-an-allowlist · MUST

Every address or origin in outside input is followed or trusted only where the program's own allowlist holds it. The program follows an address when it sends its user there, as to a redirect's target, and trusts an origin when it decides by it whom it believes or what it allows, as by a message's origin or a request's.

| Why |
|---|
| whoever chooses the address chooses where the program sends its user and whom it believes, as an open redirect after a sign-in or a message accepted from any sender does. |

### outside-identifier-normalised-before-comparison · MUST

Every identifier in outside input that grants or refuses access is normalised before it is compared, stored or checked against a list. Such identifiers include a user name, an email address and a domain name, and it is normalised to one form: the one its standard defines, as PRECIS does a user name's and IDNA a domain name's, else its Unicode NFKC form with its case folded, lower-cased where the language offers no full case fold, and then brought to NFKC again; an email address is folded whole, though its standard leaves the case of its local part to the mail server.

| Why |
|---|
| two spellings of one identifier (another case, another Unicode form, a trailing dot) pass a check made on one and reach what the other guards, and a case fold can undo the normal form made before it, so two spellings folded last can still differ — RFC 8265, the Unicode Standard, section 3.13, and Unicode Standard Annex #15. |

### outside-identifier-with-invisible-code-point-refused · MUST

Every identifier in outside input brought to its NFKC form is refused when it holds a default-ignorable or control code point. Such an identifier is one that `outside-identifier-normalised-before-comparison` governs: one that grants or refuses access.

| Why |
|---|
| a default-ignorable code point, such as a zero-width joiner, survives every fold and makes a second spelling that looks the same, and a control code point, such as a line break, splits the identifier where a log or a list reads it by lines — Unicode Standard Annex #31. |

### outside-input-never-rebuilt-as-objects · MUST

All outside input is read only by a format that builds plain data, never by one that builds objects or runs code.

| Why |
|---|
| such a format runs whatever its sender put in it. |

### outside-input-parsed-without-external-references · MUST

Every parser of outside input resolves an external reference the input names only from a list the program fixes. Such references include an entity or a document type, an include and a remote reference.

| Why |
|---|
| a reference inside the input makes the parser read a file or call an address the sender chose, on the program's behalf. |

## Cryptography

### cryptographic-algorithm-approved-by-current-guidance · MUST

All cryptography uses only the algorithms, modes and key sizes that current guidance approves. The guidance is that of a recognised standards body, and one it deprecates is never chosen for new data.

| Why |
|---|
| a vetted library still offers broken algorithms, and data protected by one is open to whoever reads it later — NIST's guidance and OWASP ASVS. |

### key-agreement-hybrid-with-post-quantum · MUST

Wherever both sides support one, every key agreement uses a hybrid exchange with a post-quantum algorithm. That holds for every one the program sets up, such as an encrypted connection, an encrypted channel or a sealed envelope. Exempt: a key agreement under a profile that requires pure ML-KEM, such as CNSA 2.0.

| Why |
|---|
| traffic recorded today is decrypted once a quantum computer can break the classical exchange, which NIST deprecates by 2030, and the hybrid keeps the classical half's strength should the new algorithm fall, while a profile that requires pure ML-KEM, as CNSA 2.0 does, has weighed that risk for its own systems — NIST's guidance and CNSA 2.0. |

### security-primitive-from-a-vetted-library · MUST

Every security primitive comes from the platform or a vetted library, never from the project's own code.

| Why |
|---|
| a home-made primitive fails silently, and an attacker finds it first. |

### guarding-token-from-a-cryptographic-random-source · MUST

Every token, nonce or identifier that guards access comes from a cryptographic random source.

| Why |
|---|
| a value from a predictable source is guessed, and whoever guesses it holds the access it guards. |

### password-stored-only-hashed · MUST

Every password the program verifies is stored only by a password-hashing function.

| Why |
|---|
| a password stored any other way is read or cracked by whoever reaches the store, and reused against its owner's other accounts. |

### secret-compared-in-constant-time · MUST

Every secret is compared in constant time.

| Why |
|---|
| a comparison that stops at the first difference tells an attacker, by its timing, how much of a guess was right. |
