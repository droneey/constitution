# Components

> Governs the lists of native components.

## General

### list-never-mapped-in-a-scroll-view → long-lists-virtualised · SHOULD

No list that can grow is mapped inside a `ScrollView`.

| Why |
|---|
| a `ScrollView` mounts every child at once, so a mapped list in it renders every row however long it grows. |
