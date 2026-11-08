# Disclosure

> Governs the contact a vulnerability is reported to.

## General

### vulnerability-contact-served-as-security-txt · SHOULD

Every program that serves HTTP to the public under a domain of its own serves its vulnerability contact as `security.txt`. It serves `/.well-known/security.txt`, as RFC 9116 sets out, with the contact for a vulnerability and the file's expiry, and the policy it follows, where it has one.

| Why |
|---|
| finders and their tools look for the contact there first, so a program without the file leaves a finder to report in public, and a file with no expiry keeps a stale address trusted, while the policy is a field the standard leaves optional — RFC 9116. |
