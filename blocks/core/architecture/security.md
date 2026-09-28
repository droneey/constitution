# Security

## Secrets

## environment-names-declared-in-one-place · SHOULD
Every environment variable the program reads is declared in one place, and code reads only declared names.
**Why:** one declaration shows what a deployment must provide, and no module reads a name nobody knows it needs.
**Check:** review
**Tags:** security

## Operations and access

## entry-point-declares-its-access · MUST
Every entry point declares its access where it is defined, at the boundary.
**Why:** access declared beside the entry point is read and reviewed with it, and an entry point without a declaration stands out.
**Check:** review
**Tags:** security
**Implements:** `access-denied-unless-granted`
