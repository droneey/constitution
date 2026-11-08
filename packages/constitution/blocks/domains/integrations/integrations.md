---
id: integrations
summary: "Other systems the program calls or gets webhooks from: calls, sagas."
requires: [transports]
languages: []
governs: ["**"]
---

# Integrations

> Another system, not run by the program and neither a store it owns nor a broker, that the program calls or that calls back an address the program gave it: how calls to it are bounded and their failures mapped, how a stream of its events reaches the application layer, how a saga's retries, compensations and outcomes decided later reach it, how the webhooks that system posts to the program are verified and processed, and how the specs stand in for it with its captured answers.
