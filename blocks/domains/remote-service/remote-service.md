---
id: remote-service
summary: "Another system the program calls: transport, failures, streams, specs."
requires: []
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: []
governs: []
---

# Remote service

> Another system the program reaches over a network and does not run itself. This block says how the transport is built and bounded, how its answers are parsed and its failures mapped, how a stream of its events reaches the domain, and how the specs stand in for a system they cannot run, with its captured answers, and keep those answers true. An engine the project owns and runs, such as its database, is not a remote service; core's integration rules hold it.
