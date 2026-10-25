# Resources

> Governs how a resource is named and changed.

## Names

### resource-path-names-nouns · SHOULD

A path names resources: a collection by a plural noun, then an identifier — `/orders/{orderId}/items` — never a verb; an action no standard method expresses is a sub-resource or a custom method of its resource.

| Why |
|---|
| a caller predicts every path from the nouns, and a verb in a path hides an operation that ignores what its method means. |

## Methods

### partial-update-by-merge-patch · SHOULD

A partial update is a `PATCH` in JSON Merge Patch (RFC 7396) or with a field mask naming what it sets: a field it leaves out stays as it was, and `null` clears one.

| Why |
|---|
| a partial update whose body replaces the fields it does not mention erases what another caller wrote. |
