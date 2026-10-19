---
id: rest-api
summary: "An HTTP API of resources: methods, statuses, answers and contract."
requires: [http-server]
extends: _api
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# REST API

> An API whose operations are HTTP methods on resources.

The block's rules bind the operations the program serves as REST resources, and no other: how a resource is named and changed, what a status and a body mean, how a value travels, and the contract every caller reads.
