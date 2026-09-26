---
id: analytics
kind: domain
summary: Typed product events, sent through replaceable sinks.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: ["**/sinks/**"]
status: stable
---

# Analytics

> Events about how people use the product, sent to one or more analytics services. **Vocabulary:** folder `sinks`, suffix `.sink`.

## tracking-waits-for-consent · MUST
Nothing is tracked, and no identifier is stored, before the user consents; declining changes nothing else in the product.
**Why:** tracking is the user's choice, and a product that tracks first and asks later has already taken it from them.
**Check:** review
**Tags:** security

## events-from-a-closed-vocabulary · MUST
Every event belongs to one closed vocabulary, each with its typed parameters; no free-form name or value is sent.
**Why:** a mistyped event name is a report that silently reads zero.
**Check:** review
**Tags:** data, types
**Implements:** `illegal-states-unrepresentable`

## sinks-behind-one-contract · SHOULD
Each analytics service is one sink, one `.sink` file in `sinks/`, under one contract beside the folder; a registry chooses the active sinks.
**Why:** a service is added or removed as one file, and nothing else knows which services exist.
**Check:** tool — names
**Tags:** architecture
**Implements:** `set-folder-holds-only-members`

## features-never-track · MUST
A feature never sends an event; the composing layer translates the feature's intents and outcomes into events.
**Why:** tracking is a concern of the product, not of any feature, and a feature that tracks knows the vocabulary of all of them.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `features-blind-to-each-other`

## analytics-fault-isolated · MUST
A failing sink neither breaks the user's action nor silences the other sinks; its fault is reported out of band.
**Why:** measurement must never cost the user the thing they came to do.
**Check:** test
**Tags:** errors
**Implements:** `errors-surfaced-never-swallowed`

## no-personal-data-in-events · MUST
No personal data and no content a person wrote is sent in an event.
**Why:** analytics services are third parties; what reaches them has left the product's control.
**Check:** review
**Tags:** security, data
**Implements:** `no-secret-or-personal-data-in-output`

## never-tracked-list-kept · SHOULD
The project keeps a written list of what is never tracked, and why.
**Why:** the list stops the same question being answered differently each time, and shows users what is left out.
**Check:** review
**Tags:** data

## product-outcomes-tracked · SHOULD
Key product outcomes — a conversion, a reason something was blocked, the use of a feature — have events, so business measures come from analytics.
**Why:** a measure nobody tracks is a decision made without its data.
**Check:** review
**Tags:** data

## context-set-once-as-dimension · SHOULD
Context shared by every event — signed in or not, the mode — is set once, as a dimension.
**Why:** every event then carries it without every call passing it.
**Check:** review
**Tags:** data

## Requirements for implementation

What any analytics library must provide.

## analytics-consent-first · MUST
The library sends nothing and stores no identifier until consent allows it.
**Why:** without it, tracking cannot wait for consent.
**Check:** review
**Tags:** security

## analytics-anonymous-by-default · MUST
Addresses are anonymised, and no user identifier is sent unless configured.
**Why:** a library that identifies users by default leaks personal data on its first event.
**Check:** review
**Tags:** security

## analytics-loads-without-blocking · SHOULD
The library loads and sends without delaying rendering.
**Why:** measurement must not make the product slower to use.
**Check:** review
**Tags:** performance

## analytics-context-dimensions · SHOULD
Dimensions set once apply to every later event.
**Why:** without it, shared context is passed with every event.
**Check:** review
**Tags:** data
