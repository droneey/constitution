# Disclosure

> Governs the contact a vulnerability is reported to.

## General

### vulnerability-contact-served-as-security-txt → vulnerability-reported-privately · MUST

A program that serves HTTP to the public under a domain of its own serves its vulnerability contact as `security.txt`. It serves `/.well-known/security.txt`, as RFC 9116 sets out, with the contact for a vulnerability, the policy it follows and the file's expiry.

| Why |
|---|
| finders and their tools look for the contact there first, so a program without the file leaves a finder to report in public, and a file with no expiry keeps a stale address trusted — RFC 9116. |
