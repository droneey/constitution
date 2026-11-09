# Releases

> Governs a release's notes and its supply chain.

## Notes

### release-carries-its-notes · SHOULD

Every release of a distributed package carries notes that say what changed.

#### Why

A consumer decides on the notes whether and how to update, and a release without them leaves every consumer to read the diff.

#### Examples

```text title="Avoid"
price-kit 2.2.0
  notes   (none)
```

```text title="Prefer"
price-kit 2.2.0
  notes   Added formatMoneyRange.
          Fixed rounding of negative
          amounts in formatMoney.
```

### release-notes-give-each-breaking-changes-migration · SHOULD

The notes of every release of a distributed package give each breaking change with its upgrade path. That path is the steps by which consumers adapt to the break.

#### Why

A break without its upgrade path leaves every consumer to rediscover what changed and how to follow it.

#### Examples

```text title="Avoid"
price-kit 3.0.0

Breaking
- formatPrice removed.
```

```text title="Prefer"
price-kit 3.0.0

Breaking
- formatPrice removed. Upgrade: replace
  formatPrice(cents) with
  formatMoney(money(cents, currency)).
```

### release-notes-name-each-fixed-vulnerability · MUST

The notes of every release of a distributed package name each vulnerability the release fixes by its identifier.

#### Why

A fixed vulnerability without its identifier is never matched to the advisory that names it, so a consumer who tracks the advisory never learns which release to take.

#### Examples

```text title="Avoid"
price-kit 2.2.1

Fixed
- A security issue in amount parsing.
```

```text title="Prefer"
price-kit 2.2.1

Fixed
- CVE-2026-31337: parseMoney ran in
  exponential time on long digit runs.
```

## Supply chain

### release-ships-an-sbom · SHOULD

Every release of a distributed package ships a software bill of materials, in SPDX or CycloneDX, that lists what the package contains.

#### Why

Without it a user cannot tell whether a newly published vulnerability reaches them, and the EU's Cyber Resilience Act asks the maker to keep one with the technical documentation.

#### Examples

```text title="Avoid"
release price-kit 2.2.0
└── price-kit-2.2.0.package
```

```text title="Prefer"
release price-kit 2.2.0
├── price-kit-2.2.0.package
└── price-kit-2.2.0.cdx.json   CycloneDX bill of materials
```
