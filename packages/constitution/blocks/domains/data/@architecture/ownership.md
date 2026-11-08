# Ownership

> Governs who reads and writes a feature's stored records, and where they live in the store.

## General

### feature-owns-its-stored-records · SHOULD

Every feature's stored records are read and written only by its own adapter modules, with their edge workers. Another feature reaches them only through the owner's operations, composed in composition, never by a read of the owner's store, a join or a view over its records.

| Why |
|---|
| a read of another feature's records couples the two through the store, where no import rule sees it, and the owner can no longer change its schema alone. |

### feature-records-in-a-namespace-of-their-own · SHOULD

Every feature's records live in a schema or namespace of their own. Exempt: a store that has neither, where they live under a name prefix of their own.

| Why |
|---|
| records that share a namespace with another feature's cannot be told apart by name, so a reader cannot say which feature owns a record, and no grant of the store can keep one feature's code from the other's records. |

### feature-namespace-reached-by-its-own-credential → credential-has-least-privilege · MUST

Where the store grants access by namespace, every feature's records are reached by a credential granted that feature's namespace alone.

| Why |
|---|
| a credential granted every feature's namespace lets a read across features go through unrefused, so the store holds no line that the import rules draw — least privilege. |
