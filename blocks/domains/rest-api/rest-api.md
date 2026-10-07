---
id: rest-api
summary: "An HTTP API of resources: methods, statuses, answers and contract."
requires: [http-server]
extends: _api
abstract: false
languages: []
dictionary: []
governs: []
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

### put-and-delete-idempotent → operation-idempotent-by-design · MUST
A `PUT` replaces its resource whole and a `DELETE` removes it, so that a repeat of either leaves the state the first left; a `DELETE` of a resource already gone answers `404`.

| Why | Tags |
|---|---|
| clients, proxies and retrying libraries repeat these methods on their own, because HTTP declares them idempotent. | [data] |

### partial-update-by-merge-patch · SHOULD
A partial update is a `PATCH` in JSON Merge Patch (RFC 7396) or with a field mask naming what it sets: a field it leaves out stays as it was, and `null` clears one.

| Why | Tags |
|---|---|
| a partial update whose body replaces the fields it does not mention erases what another caller wrote. | [data] |

### creation-answers-201-with-location · SHOULD
A creation answers `201` with a `Location` header holding the new resource's address, and the resource as it was stored.

| Why | Tags |
|---|---|
| the caller learns the identifier and the fields the server set without a second request and without building an address itself. | [] |
