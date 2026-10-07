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
Every kind of personal data the program stores is listed with its purpose, its retention period and the processors it reaches.

| Why | Tags |
|---|---|
| data nobody listed is kept beyond its purpose and missed by every request to export or erase it. | [data] |

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
A person's request to erase their data erases it everywhere the program keeps it — its stores, its caches, its processors — save what a law makes it keep, within the time the law of the region sets; a backup that holds it expires within its retention, and a restore re-applies every erasure made since.

| Why | Tags |
|---|---|
| a copy left behind is data the person was told was gone. | [data] |

### personal-data-corrected-on-request · SHOULD
A person can correct their personal data, or have it corrected on request.

| Why | Tags |
|---|---|
| data the person knows is wrong goes on deciding about them until someone fixes it. | [data] |
