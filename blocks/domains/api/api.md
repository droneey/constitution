---
id: api
summary: "A program that serves requests: its handlers, failures and callers."
requires: []
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: []
governs: ["**/api/**"]
---

# API

> A program other programs call: an HTTP API, or a server of tools that models call. How it answers a failure, what it refuses from callers it does not know and what it asks of a server framework are in `foundation/`; where its handlers live and the one handler that answers every failure, in `architecture/`. A rule about a status, a cookie or an origin binds what the program serves over HTTP.
