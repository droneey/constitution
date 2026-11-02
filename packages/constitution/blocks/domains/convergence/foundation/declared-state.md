# Declared state

> Governs what a run reads and how each section is applied.

## Input

### run-reads-one-config-file · MUST

A run reads one config file as its single input. Its user writes the file, and the run reads it whole and moves the world toward it.

| Why |
|---|
| inputs scattered across flags and files cannot be reviewed, repeated or diffed, so nobody can say from the inputs what a run will do. |

### environment-read-only-for-the-config-files-names → configuration-enters-only-through-its-declaration · MUST

The environment is read only for the names the config file references and those that describe the program's host.

| Why |
|---|
| a name read past the config file is an input nobody declared, and the same file then does different things on two machines. |

## Sections

### declared-section-states-every-field → absence-shown-by-the-type · MUST

A declared section states every field. Inside a section the config file declares, every field the program manages is stated, and “there is none” is written out and read as absence.

| Why |
|---|
| a field the program fills in by default is a decision the user never saw, and a config file that leaves one out is no longer the whole truth of what the run does. |

### absent-section-left-untouched · MUST

An absent section leaves untouched everything it would manage. For a section the config file leaves out, a run neither creates, changes nor removes any of it.

| Why |
|---|
| a missing section read as “remove everything” destroys what the user only chose not to manage. |
