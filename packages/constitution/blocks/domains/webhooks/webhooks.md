---
id: webhooks
summary: Webhooks the program sends and receives, and their format.
requires: [remote-service]
extends: null
abstract: false
languages: []
governs: ["**"]
---

# Webhooks

> HTTP requests one system posts to another when something happens there.

The block covers the webhooks the program sends — their format, their signature, their retries and the endpoints they reach — and, where the program serves HTTP, those it receives from any sender: how they are verified, processed and acknowledged; a program that only sends serves no HTTP.
