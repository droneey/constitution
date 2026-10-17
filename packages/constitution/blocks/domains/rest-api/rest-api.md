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

> An API whose operations are HTTP methods on resources. Its rules bind the operations the program serves as REST resources, and no other: how a resource is named and changed, what a status and a body mean, how a value travels, and the contract every caller reads.

## Resources

### resource-path-names-nouns · SHOULD

A path names resources: a collection by a plural noun, then an identifier — `/orders/{orderId}/items` — never a verb; an action no standard method expresses is a sub-resource or a custom method of its resource.

| Why | Tags |
|---|---|
| a caller predicts every path from the nouns, and a verb in a path hides an operation that ignores what its method means. | [] |

## Methods

### partial-update-by-merge-patch · SHOULD

A partial update is a `PATCH` in JSON Merge Patch (RFC 7396) or with a field mask naming what it sets: a field it leaves out stays as it was, and `null` clears one.

| Why | Tags |
|---|---|
| a partial update whose body replaces the fields it does not mention erases what another caller wrote. | [data] |
