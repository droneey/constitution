# Layout

> Governs where scheduled jobs live.

## Vocabulary

**`jobs/`**{#background-job} holds a presentation's scheduled jobs.

## Delivery units

### job-lives-in-jobs → delivery-unit-beside-what-it-serves · SHOULD

Every scheduled job lives in a file of its own in the `jobs/` of the presentation that `delivery-unit-beside-what-it-serves` gives it: that of the feature or composition module whose operation it calls, or the program's where it calls those of several.

| Why |
|---|
| a job kept apart from the work it starts changes in a second place whenever that work does, and the reader of the feature misses a way work enters it. |
