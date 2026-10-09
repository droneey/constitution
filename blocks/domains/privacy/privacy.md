---
id: privacy
summary: "Personal data: minimised, consented, kept, exported and erased."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Privacy

> A product that handles personal data: the consent a law asks for and nothing more, the opt-out signals a law makes binding, how long each kind of data is kept, and a person's rights to export and erase it.

## Personal data

### personal-data-inventoried · MUST
Every kind of personal data the program stores is listed with its purpose, the legal basis of that purpose, its retention period, the recipients it reaches — processors and controllers — and the regions it is sent to.

| Why | Tags |
|---|---|
| data nobody listed is kept beyond its purpose and missed by every request to export or erase it. | [data] |

### privacy-notice-follows-the-inventory · MUST
A person is told, where their data is collected, what is collected, for which purpose and on which basis, who receives it, how long it is kept and how to use their rights, and the notice changes with the inventory.

| Why | Tags |
|---|---|
| a person can use a right only over data they know is kept, and a notice written apart from the inventory drifts from what the program does. | [data] |

### personal-data-collected-only-for-its-purpose · MUST
Personal data is collected only as far as a stated purpose needs, and the settings that share or expose it start at their most protective.

| Why | Tags |
|---|---|
| data never collected cannot leak, be misused or be asked for back. | [data] |

### personal-data-kept-no-longer-than-its-retention · MUST
Personal data is deleted or made anonymous when the retention period of its purpose ends.

| Why | Tags |
|---|---|
| data kept past its purpose is a liability that grows with every breach and every request. | [data] |

### personal-data-reaches-only-a-listed-recipient · MUST
Personal data reaches another company only when the inventory lists it as a recipient — a processor bound by terms to the program's purpose, or a controller with a legal basis of its own, the person's consent among them — and leaves the region whose law protects it only under a transfer that law allows.

| Why | Tags |
|---|---|
| data handed to a company nobody listed is data no request to export or erase reaches, under terms nobody read. | [data] |

## Rights

### personal-data-exported-on-request · MUST
A person's request for their data is answered with all of it, in a format a machine reads, within the time the law of the region sets.

| Why | Tags |
|---|---|
| the right of access and portability is the person's, and data missed by the export is data they cannot check. | [data] |

### rights-request-verified-before-it-is-answered · MUST
A request to export, erase or correct personal data is answered only once the requester is shown to be its person — through their sign-in where they have an account, otherwise by a check proportionate to the data — and the check asks for no more data than it needs.

| Why | Tags |
|---|---|
| an export sent to an impostor is a breach, and an erasure on a stranger's word destroys a person's data. | [data, security] |

### personal-data-erased-on-request · MUST
A person's request to erase their data erases it everywhere the program keeps it — its stores, its caches, its processors — and is passed on to the other recipients it reached, save what a law makes it keep, within the time the law of the region sets; a backup that holds it expires within its retention, and a restore re-applies every erasure made since.

| Why | Tags |
|---|---|
| a copy left behind is data the person was told was gone. | [data] |

### personal-data-corrected-on-request · MUST
A person's request to correct their personal data corrects it, within the time the law of the region sets.

| Why | Tags |
|---|---|
| data the person knows is wrong goes on deciding about them until someone fixes it. | [data] |

## Breaches

### personal-data-breach-notified-in-time · MUST
A breach of personal data is recorded with its effects and its remedy, notified to the supervisory authority within the time the law of the region sets — 72 hours under GDPR Article 33 — and to the persons it puts at high risk without undue delay.

| Why | Tags |
|---|---|
| the deadline runs from when the breach is known, and persons told late cannot protect themselves in time. | [data, security] |
