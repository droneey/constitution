# Disclosure

> Governs the contact a vulnerability is reported to.

## General

### vulnerability-contact-served-as-security-txt · SHOULD

Every program that serves HTTP to the public under a domain of its own serves its vulnerability contact as `security.txt`. It serves `/.well-known/security.txt`, as RFC 9116 sets out, with the contact for a vulnerability and the file's expiry, and the policy it follows, where it has one.

#### Why

Finders and their tools look for the contact there first, so a program without the file leaves a finder to report in public, and a file with no expiry keeps a stale address trusted, while the policy is a field the standard leaves optional — RFC 9116.

#### Examples

```text title="Avoid"
GET https://shop.example/.well-known/security.txt

HTTP/1.1 404 Not Found
Cache-Control: no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET https://shop.example/.well-known/security.txt

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Cache-Control: public, max-age=86400
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

Contact: mailto:security@shop.example
Expires: 2027-06-30T00:00:00.000Z
Policy: https://shop.example/security-policy
```
