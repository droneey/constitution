# Declared state

> Governs what a reconciliation run reads and how each section of the config file is applied.

## Input

### run-reads-one-config-file · MUST

Every reconciliation run takes the state it is to reach from one config file alone, read whole.

| Why |
|---|
| inputs scattered across flags and files cannot be reviewed, repeated or diffed, so nobody can say from the inputs what a reconciliation run will do. |

### environment-read-only-for-the-config-files-names · MUST

Every environment variable the program reads is one the config file references or one that describes its host. A variable describes the host when it holds, for instance, its user's home folder or its terminal's type. Exempt: a variable that changes nothing a reconciliation run does to the managed world, such as one that sets the program's log level.

| Why |
|---|
| a variable read past the config file is an input nobody declared, and the same file then does different things on two machines. |

## Sections

### declared-section-states-every-field → absence-shown-by-the-type · MUST

Every section the config file declares states every field the program manages there. A field that holds nothing says so, written out and read as absence. Exempt: a field a later release added to the section, which the config file may leave out and of which a reconciliation run then changes nothing.

| Why |
|---|
| a field the program fills in by default is a decision the user never saw, and a config file that leaves one out is no longer the whole truth of what the reconciliation run does, while a later field left out and left untouched, as an absent section is, keeps every config file written before it doing what it did. |

### absent-section-left-untouched · MUST

For every section the config file leaves out, a reconciliation run creates, changes and removes nothing of what that section would manage.

| Why |
|---|
| a missing section read as “remove everything” destroys what the user only chose not to manage. |
