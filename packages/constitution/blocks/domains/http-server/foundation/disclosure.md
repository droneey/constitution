# Disclosure

> Governs the contact a vulnerability is reported to.

## General

### vulnerability-contact-served-as-security-txt → vulnerability-reported-privately · MUST

A program that serves HTTP to the public under a domain of its own serves `/.well-known/security.txt`, as RFC 9116 sets out, with the contact for a vulnerability, the policy it follows and the file's expiry.

| Why | Tags |
|---|---|
| finders and their tools look for the contact there first, and the expiry keeps a stale address from being trusted. | [security] |
