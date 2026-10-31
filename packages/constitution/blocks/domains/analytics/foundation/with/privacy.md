# Privacy

> Governs the personal data an event carries, the network address an analytics library drops, and what it keeps before consent.

## General

### event-names-no-person → personal-data-kept-out-of-output · MUST

No event carries data that names a person — a name, an email, a phone, an address — or content a person wrote; the only identifier an event carries is the analytics library's own pseudonymous one.

| Why |
|---|
| analytics services are third parties, and what reaches them has left the product's control. |

## Requirements for implementation

### analytics-stores-nothing-until-consent · MUST

The library can measure without storing anything on the device or sending an identifier — anonymously where the law exempts the measurement from consent — and holds both back until consent where it does not.

| Why |
|---|
| a library that cannot run without storing or identifying makes even the measurement the law exempts wait for consent. |

### analytics-drops-the-ip-address · MUST

The library truncates or drops the IP address.

| Why |
|---|
| a library that identifies users by default leaks personal data on its first event. |
