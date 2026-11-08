# Dependencies

> Governs packages, downloads and tools taken from others.

## Vocabulary

The **standard library**{#standard-library} is the language's own, extended only by the effect-free libraries a language's block names, each with its reason, such as the extension of the standard its language's own maintainers ship; a parser, a validator of schemas or a vendor's client is never one. A library so named counts as the standard library wherever a rule limits what code may import, and stays a dependency the rules of this chapter hold.

A **registry**, in this chapter always a package registry, is a service that serves the released versions of packages immutably.

A package's **published entries** are what it lets other packages import: its surface, as the layout chapter defines it, and each further entry its manifest declares.

An **extension of an agent**, an agent as the agents chapter defines it, is a server, an add-on or a set of instructions that adds actions or knowledge to an agent and runs with its rights.

A **download** is a file or a reusable unit of work the program, its build or its automation fetches outside a package manager, such as a binary, an archive or an image.

A download's **digest** is a checksum of its content or an immutable content identifier that names it.

## Pinning

### dependencies-locked-by-one-lockfile · MUST

Where its ecosystem has a lockfile, every language's dependencies are pinned by one.

#### Why

Dependencies no lockfile pins install whatever versions each install resolves, so two machines run different code from the same manifests.

#### Examples

```text title="Avoid"
shop/
├── web/
│   ├── manifest
│   └── lockfile
└── worker/
    └── manifest    ranges only, nothing pins them
```

```text title="Prefer"
shop/
├── web/
│   ├── manifest
│   └── lockfile
└── worker/
    ├── manifest
    └── lockfile
```

### lockfile-kept-in-the-repository · MUST

Every lockfile is kept in the repository.

#### Why

A lockfile kept outside the repository pins nothing for whoever installs from the repository, and changes in no change anyone reviews.

#### Examples

```text title="Avoid"
shop/
├── manifest
├── .ignore        lists the lockfile
└── src/
```

```text title="Prefer"
shop/
├── manifest
├── lockfile
└── src/
```

### lockfile-matches-its-manifests · MUST

Every lockfile always matches its manifests.

#### Why

A lockfile that drifts from its manifests installs versions nobody reviewed.

#### Examples

```text title="Avoid"
change: add pdf-kit
  M manifest    + pdf-kit 2.3.1
                  (lockfile unchanged)
```

```text title="Prefer"
change: add pdf-kit
  M manifest    + pdf-kit 2.3.1
  M lockfile    + pdf-kit 2.3.1 and its 3 dependencies

$ install, refusing to change the lockfile
lockfile matches the manifests
```

### dependencies-managed-by-one-package-manager · MUST

Every language's dependencies are managed by one package manager.

#### Why

Two package managers resolve differently, so the same manifests install different versions.

#### Examples

```text title="Avoid"
shop/
├── manifest
├── lockfile of package manager A
├── lockfile of package manager B
└── src/
```

```text title="Prefer"
shop/
├── manifest
├── lockfile of package manager A
└── src/
```

### download-pinned-to-its-version · MUST

Every download is pinned to its most specific version, which stands beside its digest wherever one pins it, never a digest alone.

#### Why

A download at a moving version runs whatever its address serves that day, and a digest alone hides from its reader and its updater which release it is.

#### Examples

```pseudo title="Avoid"
const SCANNER_SHA256 = "9f86d081…"

let scanner = call download(RELEASES_URL + "/latest/scanner")
verifySha256(scanner, SCANNER_SHA256)
```

```pseudo title="Prefer"
const SCANNER_VERSION = "2.4.1"
const SCANNER_SHA256 = "9f86d081…"

let scanner = call download(RELEASES_URL + "/v" + SCANNER_VERSION + "/scanner")
verifySha256(scanner, SCANNER_SHA256)
```

### download-checked-against-its-digest · MUST

Every download is checked against its digest before it is used, never trusted on its version alone. Exempt: code its maker changes by design, such as a tag manager's or a payment provider's script, which the program loads only from the one origin it allows that code, through one loader.

#### Why

A download no digest checks runs whatever its address serves, the version it names included, once that address or its server is taken.

#### Examples

```pseudo title="Avoid"
let scanner = call download(SCANNER_URL_V2_4_1)
run(scanner)
```

```pseudo title="Prefer"
let scanner = call download(SCANNER_URL_V2_4_1)

if sha256(scanner) is not SCANNER_SHA256_V2_4_1 then
  throw new DigestMismatchError({ download: "scanner 2.4.1" })

run(scanner)
```

### tool-pinned-exactly-by-the-repository · MUST

Every tool no lockfile pins, and the code's runtime, is pinned to one exact version in a file of the repository. Exempt: the build tool a package's manifest requires, which whoever builds the package resolves and which is held to a range below the next release the tool's own versioning marks incompatible.

#### Why

A version no file pins is whatever each machine resolves, so the check reports differently from one machine to the next.

#### Examples

```text title="Avoid"
README
  Install the latest type checker,
  then run the check.
```

```text title="Prefer"
tools file
  type-checker  5.6.3
```

### pinned-tool-never-installed-globally · MUST

Every tool the repository pins, and the code's runtime, is installed for the repository, never globally. Exempt: the build tool a package's manifest requires, which whoever builds the package installs.

#### Why

A tool installed globally runs in another version on every machine, and its new version changes what the check reports.

#### Examples

```text title="Avoid"
README
  Install the formatter 3.4.2 for your user,
  then run the check.
```

```text title="Prefer"
tools file
  formatter  3.4.2

README
  Run the check; it installs the pinned
  tools into the repository first.
```

### agent-extension-pinned · MUST

Every extension of an agent is pinned to an exact version or digest. It never runs at a moving reference; a remote one whose version cannot be pinned has its declaration of what it offers pinned, and a changed declaration is withheld until a person has reviewed it. One that is a download is pinned as the download-pinned-to-its-version rule pins every download.

#### Why

An extension runs with the agent's rights, and its next release can turn malicious with no sign but a changed declaration.

#### Examples

```text title="Avoid"
agent extensions
  tracker  tracker-server@latest
```

```text title="Prefer"
agent extensions
  tracker  tracker-server@2.4.1
```

## Installing

### dependency-installed-only-from-a-registry · MUST

Every package, a transitive one included, is installed only from a registry. It is never installed from the place its code is developed, an archive's address or a path outside the repository. Exempt: a package of an ecosystem with no registry, taken as a download, pinned and checked.

#### Why

A dependency from where its code is developed, an address or a path has no release date for the cooldown and no provenance, and runs code as it installs even where install scripts are off.

#### Examples

```text title="Avoid"
manifest
  dependencies:
    pdf-kit  from https://code.example/acme/pdf-kit
```

```text title="Prefer"
manifest
  dependencies:
    pdf-kit  2.3.1
```

### private-package-installed-only-from-its-named-registry · MUST

Every private package is installed only from the registry the project names for it. A private package is one served only by a registry that is not open to all, such as a company's own.

#### Why

A private name that is free on a public registry is installed from whoever claims it there.

#### Examples

```text title="Avoid"
registries
  default  https://registry.public.example
  extra    https://packages.acme.example
```

```text title="Prefer"
registries
  default  https://registry.public.example
  @acme/*  https://packages.acme.example    only
```

### dependency-provenance-verified · MUST

Every dependency whose registry publishes provenance or signatures is installed only once they verify.

#### Why

A hijacked release is published from somewhere else than its project's own build, and its provenance does not verify.

#### Examples

```text title="Avoid"
$ install pretty-dates@3.2.0
added pretty-dates 3.2.0
```

```text title="Prefer"
$ install pretty-dates@3.2.0
provenance verified: built from its
  repository by its own pipeline
added pretty-dates 3.2.0
```

### release-that-lost-its-provenance-refused · MUST

Every release of a dependency that lacks the provenance or signatures its earlier releases carried is rejected.

#### Why

A hijacked release is published outside its project's own build, so it lacks what that build attached, and the missing provenance is the one sign a release with nothing to verify gives.

#### Examples

```text title="Avoid"
$ install pdf-kit 2.4.0
pdf-kit 2.3.1  provenance verified
pdf-kit 2.4.0  no provenance
installed pdf-kit 2.4.0
```

```text title="Prefer"
$ install pdf-kit 2.4.0
pdf-kit 2.3.1  provenance verified
pdf-kit 2.4.0  no provenance
refused: 2.4.0 lacks the provenance 2.3.1 carried
```

### new-release-adopted-after-a-cooldown · MUST

Every new release of a dependency is adopted only after a cooldown of at least three days. Exempt: a fix for a known vulnerability that cannot wait, exempted by name with its advisory beside the exemption, which leaves at the next update.

#### Why

Of ten major hijacked releases of 2024 and 2025, seven were found within hours, and the largest package registry lets an author unpublish a release for its first three days, so a release that waited three days has outlived most hijacks and can no longer vanish from under its adopters — Woodruff's dependency cooldowns (2025).

#### Examples

```text title="Avoid"
Mon 09:00  pretty-dates 3.2.0 out
Mon 09:20  update merged
Mon 15:00  3.2.0 pulled: hijacked
```

```text title="Prefer"
Mon 09:00  pretty-dates 3.2.0 out
Mon 15:00  3.2.0 pulled: hijacked
Wed 10:00  3.2.1 out
Sat 10:00  3.2.1 three days old:
           update merged
```

### install-scripts-run-only-for-listed-dependencies · MUST

Every dependency runs code as it is installed or built only when it is listed by name as allowed to.

#### Why

An install script runs with the developer's rights before anyone reviews what it does.

#### Examples

```text title="Avoid"
$ install
ran 214 install scripts
```

```text title="Prefer"
$ install
ran the install script of
  image-codec, listed as allowed
skipped 213 install scripts
```

## Choosing and using

### new-dependency-vetted · SHOULD

Every new dependency, an extension of an agent included, is vetted before it is added. Its name is confirmed in the registry as the intended project rather than taken from generated code, and it is checked against the signs of a malicious package, such as a name one typo from a popular one, a recent first release or change of owner, few downloads, no published source or obfuscated code.

#### Why

A dependency runs with the project's rights, so one added unvetted, as a name generated code invented, runs its author's code in every build.

#### Examples

```text title="Avoid"
Generated code imports
iso8601-duraton; installed it.
```

```text title="Prefer"
Need: parse ISO 8601 durations,
  ~200 lines of edge cases of
  our own
Name: iso8601-duration, the
  intended project on the
  registry
First release 2019, one owner,
  2.1M downloads a week
Source repository linked, code
  readable
```

### new-dependency-needed · SHOULD

Every new dependency, an extension of an agent included, has a reason it cannot be a few lines of the project's own.

#### Why

A dependency added for what a few lines would do brings its own updates, vulnerabilities and licence for nothing the project needed.

#### Examples

```pseudo title="Avoid"
import padStart from "left-pad-plus"

let invoiceNumber = padStart(toText(sequence), INVOICE_NUMBER_DIGITS, "0")
```

```pseudo title="Prefer"
let invoiceNumber = toText(sequence).padStart(INVOICE_NUMBER_DIGITS, "0")
```

### dependency-reached-through-its-published-entries · MUST

Every dependency is reached only through its published entries, never through its internal paths.

#### Why

Internal paths change between releases without notice, so code that reaches one breaks at an update no changelog warned of.

#### Examples

```pseudo title="Avoid"
import { parseIso }
  from "dates/internal/iso"

let due = parseIso(invoice.dueDate)
```

```pseudo title="Prefer"
import { parseIso } from "dates"

let due = parseIso(invoice.dueDate)
```

### package-declares-every-dependency-it-imports · MUST

Every package declares in its own manifest every dependency it imports, never relying on one that another manifest or another dependency brings. Exempt: the language's own library.

#### Why

An undeclared import works only while another declaration happens to bring it, and breaks the package when it is installed alone or that declaration goes.

#### Examples

```text title="Avoid"
packages/invoices/manifest
  dependencies: money 1.4.0
packages/invoices/src/invoice-pdf
  import pdf-kit       brought by packages/reports
```

```text title="Prefer"
packages/invoices/manifest
  dependencies: money 1.4.0, pdf-kit 2.3.1
packages/invoices/src/invoice-pdf
  import pdf-kit
```

### production-code-imports-no-tool · MUST

All production code imports only the dependencies it runs on, never one that only builds, tests or lints.

#### Why

A tool imported by the program ships with it, and its next release changes the program without anyone choosing it.

#### Examples

```pseudo title="Avoid"
# infrastructure/system/order-id-source.adapter
import { fakeData } from "fake-data-generator"

function createOrderIdSource()
  return { next: function() return fakeData.uuid() }
```

```pseudo title="Prefer"
# infrastructure/system/order-id-source.adapter
import { randomUuid } from "std/random"

function createOrderIdSource()
  return { next: function() return randomUuid() }
```

## Health

### known-vulnerability-reported-by-the-check · MUST

Every known vulnerability of every dependency is reported by the check, a development one and an accepted one included.

#### Why

A vulnerability the check keeps quiet about is one nobody weighs again, so one accepted as out of the program's reach is first noticed by its attacker once a change brings it within reach.

#### Examples

```text title="Avoid"
audit settings
  only: production dependencies
  ignore: CVE-2025-31842
```

```text title="Prefer"
audit settings
  dependencies: production and development
  accepted, still reported:
    CVE-2025-31842  review by 2026-12-01
```

### dependency-free-of-known-vulnerabilities · MUST

Every change fails the check while a dependency, a development one included, has a known vulnerability. Exempt: a vulnerability a person accepted by name, with its advisory, why it does not reach the program or why no fix exists yet, and a date to review it.

#### Why

A known vulnerability shipped is one an attacker already knows how to use, whatever its severity says of it in general, and one kept without a person who accepted it and a date to review it is forgotten until it is exploited.

#### Examples

```text title="Avoid"
$ audit
1 moderate, 2 low
left as they are: low, or only
in development
```

```text title="Prefer"
$ audit
1 moderate, accepted:
  CVE-2025-31842 in path-matcher
  10.3.0, development only
  why: the linter walks only our
    own files with it
  accepted by Ann Lee
  review by 2026-12-01
```

### dependency-licence-on-the-allowlist · MUST

Every dependency the program ships or loads at run time has a licence on the project's allowlist. Exempt: a tool that only builds, tests or checks it, named with its reason, and the system the program runs on, such as an operating system, an image's base and its system packages.

#### Why

A licence the project cannot honour is an obligation it took on without knowing, while the system it runs on comes under that system's own licences.

#### Examples

```text title="Avoid"
$ licences
chart-kit 4.0.0  AGPL-3.0
date-kit  2.3.1  MIT
no allowlist; nothing refused
```

```text title="Prefer"
allowlist: MIT, Apache-2.0,
  BSD-3-Clause, ISC
$ licences
chart-kit 4.0.0  AGPL-3.0
  not on the allowlist: refused
date-kit  2.3.1  MIT
```

### deprecated-dependency-replaced · MUST

Every dependency deprecated as a whole is replaced by its successor, another package or the project's own code.

#### Why

A deprecated package gets no more fixes, so its next vulnerability stays open.

#### Examples

```text title="Avoid"
$ install
warn: http-request 2.88.2 is
  deprecated as a whole
```

```text title="Prefer"
manifest
- http-request  2.88.2
+ http-client   6.21.0
```
