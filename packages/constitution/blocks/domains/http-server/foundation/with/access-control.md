# Access control

> Governs how an answer shaped by its caller is cached, and how a delete of a resource its caller may not see is answered.

## Caches

### personal-answer-kept-out-of-shared-caches → caller-shaped-result-never-served-from-a-cache-to-another · MUST

An answer shaped by its caller is kept out of shared caches. Such an answer — their own data, their rights, their tenant — sets `Cache-Control: private` or `no-store`, and no shared cache in front of the server, a CDN's or a proxy's, is given a rule that stores it anyway.

| Why |
|---|
| with no directive a shared cache may keep one caller's answer and serve it to the next. |

## Deletes

### hidden-resource-delete-answers-as-gone → hidden-object-answered-as-not-found · MUST

A `DELETE` of a resource its caller may not see answers success, as one of a resource already gone. The resource is gone to that caller, and nothing that caller can see changes.

| Why |
|---|
| a `404` for a resource the caller may not see, where a `DELETE` of one already gone answers success, tells that caller the resource exists. |
