# Privacy

> Governs the personal data an event carries, the network address an analytics library drops, and what it keeps before consent.

## General

### event-names-no-person → personal-data-kept-out-of-output · MUST

No event names a person. It carries no data that names one — a name, an email, a phone, an address — nor content a person wrote; the only identifier it carries is the analytics library's own pseudonymous one.

| Why |
|---|
| analytics services are third parties, so personal data an event carries leaves the product's control, where no erasure the product makes reaches it — data minimisation. |

## Requirements for implementation

### analytics-library-can-wait-for-consent · MUST

The analytics library can wait for consent before it stores or identifies. It can measure without storing anything on the device or sending an identifier — anonymously where the law exempts the measurement from consent — and holds both back until consent where the law does not.

| Why |
|---|
| a library that cannot run without storing or identifying makes even the measurement the ePrivacy Directive exempts wait for consent — privacy by default. |

### analytics-drops-the-ip-address · MUST

The library truncates or drops the IP address.

| Why |
|---|
| a library that identifies users by default leaks personal data on its first event — privacy by default. |
