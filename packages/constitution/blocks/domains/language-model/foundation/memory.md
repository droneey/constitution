# Memory

> Governs what an agent keeps in its memory and how it reads it back.

## General

### memory-keeps-its-source-and-person · SHOULD

What an agent writes to its memory from text others wrote keeps its source, is scoped to its person, and is read back as content, never as instructions.

| Why |
|---|
| memory written from a poisoned page steers every later run that reads it, unseen. |
