# Security

## Secrets

## environment-names-declared-in-one-place · SHOULD
Every environment variable the program reads is declared in one place, and code reads only declared names. The local environment file is ignored by version control; its committed example carries placeholders only.
**Why:** one declaration shows what a deployment must provide, and a real value never lands in the example.
**Check:** review
**Tags:** security

## Operations and access

## access-denied-unless-granted · MUST
Access is denied unless a rule grants it. Every entry point declares its access, and a test proves each one does.
**Why:** an entry point that forgets to declare its access is open by default, and only a test notices the one that forgot.
**Check:** test
**Tags:** security
