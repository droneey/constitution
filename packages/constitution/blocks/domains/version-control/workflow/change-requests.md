# Change requests

> Governs how a change request is reviewed, described and landed.

## General

### changes-reach-main-line-through-review · MUST

Every change reaches the main line through a reviewed change request, a **pull request** or a merge request as its host names it; the version commit and tag of the **release automation**, the tool that numbers and tags each release, are the one exception.

| Why |
|---|
| review is the last point where a person sees the change before it ships, and a change that skips it ships unseen. |

### change-request-lands-as-one-commit · MUST

A change request reaches the main line as one commit, its commits joined by a **squash**, and no work-in-progress or fix-up commit reaches it.

| Why |
|---|
| one commit per change keeps the main line readable and revertible change by change, and a work-in-progress commit there is a state nobody meant to ship. |

### change-request-reviewable-in-one-sitting → change-limited-to-its-task · SHOULD

A change request is small enough to review in one sitting, and one that mixes concerns is split.

| Why |
|---|
| a reviewer reads a small change closely and skims a large one. |

### change-request-description-holds-the-reason · MUST

A change request's description holds the reason for the change, the migration of a breaking change and the issue it closes.

| Why |
|---|
| the description is where a reviewer reads why, and what is missing there is decided without it. |
