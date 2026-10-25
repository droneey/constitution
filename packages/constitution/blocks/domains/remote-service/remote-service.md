---
id: remote-service
summary: Another system the program calls, hears from or pushes to.
requires: []
extends: null
abstract: false
languages: []
governs: ["**"]
---

# Remote service

> Another system the program reaches over a network, or that reaches the program, and that it does not run itself: how calls to it are bounded and their failures mapped, how what the program pushes to it is signed and retried, how a stream of its events reaches the domain, and how the specs stand in for it with its captured answers.

What it pushes to the program is received by the rules of the domain of the protocol it arrives over. An engine the project owns and runs, such as its database, is not a remote service.
