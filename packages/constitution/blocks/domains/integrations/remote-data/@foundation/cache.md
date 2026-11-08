# Cache

> Governs where remote data lives, a read of it, the invalidation a write makes, where their failures go and the remote-data cache that holds it, in the program and in its specs.

## Vocabulary

**Remote data** is data another system owns and decides on, which the program reads to show or act on and changes only through that system.

The **remote-data cache** is the program's store of the remote data it has read, each entry under the key of the read that fetched it.

## Copies

### remote-data-lives-only-in-its-cache → fact-has-one-source · MUST

Every piece of remote data lives in the program only in its remote-data cache, never copied into state the program keeps elsewhere. Exempt: a replica the program declares with its source and its refresh, and an identifier or a follow-up a remote system minted for what the program's own command started, which the program keeps as its own record.

| Why |
|---|
| a copy goes stale the moment the remote system changes the data, and the program then acts on the copy — a single source of truth. |

## Reads

### read-superseded-for-its-key-is-cancelled → outside-call-can-be-cancelled · MUST

Every read superseded for its key is cancelled, so only the latest answer reaches the remote-data cache. A read is superseded by one that replaces what is cached for its key, such as a refetch after a write or an invalidation.

| Why |
|---|
| an answer that arrives late otherwise overwrites a newer one, and the program shows data it no longer asked for. |

### cache-shares-one-read-per-key · SHOULD

All reads of one key share one request and one entry of the remote-data cache.

| Why |
|---|
| two readers of one key that each fetch it make two requests and may show two answers. |

### staleness-set-per-key · SHOULD

Every key of the remote-data cache has its own staleness: how long its entry stays fresh and when it is read again.

| Why |
|---|
| one policy for every key either fetches again data that never changes or shows stale data that changes every second. |

## Writes

### write-invalidates-its-entries-by-a-shared-name · MUST

Every write invalidates the remote-data cache's entries it affects by a name they share, never key by key. Such a name is a key prefix, a tag or a type.

| Why |
|---|
| a write that invalidates one exact key at a time must list every entry it touched, and an entry it misses stays stale. |

## Failures

### remote-data-failure-reaches-one-handler · MUST

Every failed read and write of remote data reaches one handler the program registers on its remote-data cache.

| Why |
|---|
| a failure any read or write can meet, such as an ended session, is otherwise handled at each read and write, each its own way, and missed at one of them. |

## Specs

### spec-builds-a-cache-of-its-own → case-independent-of-order · SHOULD

Every spec that uses a remote-data cache builds one of its own, and no remote-data cache is shared between specs.

| Why |
|---|
| a remote-data cache shared between specs carries one spec's data into the next, which then passes or fails by their order. |

### spec-cache-retries-nothing · SHOULD

Every remote-data cache a spec builds has its retries off.

| Why |
|---|
| a failed answer retried hides behind the retries' delay instead of failing the case at once, so a spec of a failure passes slowly or times out for a reason it does not name. |
