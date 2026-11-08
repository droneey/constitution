# Data

> Governs where a TypeScript aggregate's rebuild from storage lives.

## Rebuild

### aggregate-rebuild-kept-off-its-companion → rebuild-from-storage-called-only-by-its-adapters · MUST

Every aggregate's rebuild from storage is a free function its root's file exports beside the type, never a member of its companion.

| Why |
|---|
| the companion goes onto the feature's surface with the aggregate's predicates and derived values, so a rebuild it holds goes there too, and a use case that reaches it builds an aggregate its starting transition never checked. |
