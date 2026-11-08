# Resources

> Governs how a resource is named and changed.

## Names

### resource-path-names-nouns · SHOULD

Every REST path names resources, never a verb. Exempt: an action no standard method expresses, which is a sub-resource or a custom method of its resource.

| Why |
|---|
| a verb in a path hides an operation that ignores what its method means, so no caller can tell from the method what the operation does. |

### collection-named-by-a-plural-noun · SHOULD

Every REST collection's path is a plural noun, followed by an item's identifier.

| Why |
|---|
| a caller predicts every path from the nouns only when each collection is named alike, and a singular collection beside plural ones is guessed wrong. |

## Methods

### partial-update-sets-only-what-it-names · MUST

Every partial update of a REST resource sets only the fields it names. It is a `PATCH` in JSON Merge Patch (RFC 7396) or with a field mask naming what it sets, a field it leaves out stays as it was, and `null` clears one.

| Why |
|---|
| a partial update whose body replaces the fields it does not mention erases what another caller wrote. |
