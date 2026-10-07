---
id: messaging
summary: "Messages through a broker or a queue: sent, consumed, scheduled."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Messaging

> A program that publishes or consumes messages — events, commands, jobs and scheduled tasks — through a broker or a queue, asynchronously and at least once: what a message carries and how its contract changes, how a publish is confirmed and ordered, how a consumer processes each message once in effect and acknowledges it after its work, how a failure is retried, dead-lettered and compensated, and how a scheduled job runs once per tick. The broker is an outside system behind a port; how a change and its message land together is in `with/owned-data.md`, and how a message is traced and its lag watched in `with/observability.md`.
