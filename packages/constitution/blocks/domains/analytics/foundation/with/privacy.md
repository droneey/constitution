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

The analytics library stores nothing on the device and sends no identifier until consent is given, where the law subjects its measurement to consent, and measures anonymously where the law exempts it.

| Why |
|---|
| a library that stores or identifies before consent makes the measurement the law exempts need consent, and starts the rest too early. |

### analytics-drops-the-ip-address · MUST

The library truncates or drops the IP address.

| Why |
|---|
| a library that identifies users by default leaks personal data on its first event. |
