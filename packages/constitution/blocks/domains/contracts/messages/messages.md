---
id: contracts/messages
summary: "Messages through a broker or a queue: publish, consume, retry."
requires: []
languages: []
governs: ["**"]
---

# Messages

> A program that publishes messages (events or command messages) through a message broker or a queue, or consumes them, another program's included: what a message carries and its contract, publishing and its order, consuming and acknowledgement, failures, retries and dead letters.

A project whose message broker the program reaches over a network lists `transports` beside this block.
