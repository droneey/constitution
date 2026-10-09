# Declared state

> Governs what a run reads and how each section is applied.

## Input

### run-reads-one-config-file · MUST
A run reads one config file its user writes as its single input, whole, and moves the world toward it.

| Why | Tags |
|---|---|
| one declared state is reviewable, repeatable and diffable, and inputs scattered across flags and files are none of these. | [] |

### environment-read-only-for-the-config-files-names → configuration-parsed-once-at-start · MUST
The environment is read only for the names the config file references and those that describe the program's host.

| Why | Tags |
|---|---|
| a name read past the config file is an input nobody declared, and the same file then does different things on two machines. | [security] |

## Sections

### declared-section-states-every-field → absence-shown-by-the-type · MUST
Inside a section the config file declares, every field the program manages is stated; “there is none” is written out and read as absence.

| Why | Tags |
|---|---|
| a field the program fills in by default is a decision the user never saw, and stating every field makes the config file the whole truth. | [data] |

### absent-section-left-untouched · MUST
A section the config file leaves out leaves untouched everything it would manage: a run neither creates, changes nor removes any of it.

| Why | Tags |
|---|---|
| a missing section read as “remove everything” destroys what the user only chose not to manage. | [data] |
