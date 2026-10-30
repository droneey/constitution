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

The block's rules bind the webhooks the program sends, in Standard Webhooks' format — signed, retried, and an endpoint disabled — and, where the program serves HTTP, those it receives from any sender: verified, processed once and acknowledged once recorded; a program that only sends serves no HTTP.
