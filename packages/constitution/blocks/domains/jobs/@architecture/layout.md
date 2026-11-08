# Layout

> Governs where scheduled jobs live.

## Vocabulary

**`jobs/`**{#background-job} holds a presentation's scheduled jobs.

## Delivery units

### job-lives-in-jobs → delivery-unit-beside-what-it-serves · SHOULD

Every scheduled job lives in a file of its own in the `jobs/` of the presentation that `delivery-unit-beside-what-it-serves` gives it: that of the feature or composition module whose operation it calls, or the program's where it calls those of several.

#### Why

A job kept apart from the work it starts changes in a second place whenever that work does, and the reader of the feature misses a way work enters it.

#### Examples

```text title="Avoid"
src/
├── scheduler/
│   └── send-overdue-reminders   calls an operation of invoices
└── features/invoices/
```

```text title="Prefer"
src/
└── features/invoices/
    └── presentation/
        └── jobs/
            └── send-overdue-reminders
```
