---
id: messaging
summary: "Work outside a request: messages, queues and scheduled jobs."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Messaging

> A program that does work outside a request: it publishes or consumes messages — events, commands and jobs — through a broker or a queue, asynchronously and at least once, or runs jobs on a schedule, with or without a broker: what a message carries and how its contract changes, how a publish is confirmed and ordered, how a consumer processes each message once in effect and acknowledges it after its work, how a failure is settled, retried and dead-lettered, and how a scheduled job runs once per tick.
