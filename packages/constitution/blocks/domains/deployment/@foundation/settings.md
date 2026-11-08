# Settings

> Governs how a setting enters the program, the source it is taken from among several, and how its configuration changes while it runs.

## Vocabulary

The program's **configuration declaration** names, in one place, each setting its host hands it, every secret included: its type, how it is parsed, whether it is required or its default, whether it may change while the program runs, and, where two sources reach the same runs, the one that wins.

A setting of this block is one its host hands the program. A value a run's user hands it to choose how it behaves, such as one among its arguments, one in a file the user keeps for the folder the run works in or for all their runs, or a preference the program keeps for them, is none, and neither is what a run works on, such as a file whose content it processes or applies, or a value such a file refers to.

## Entry

### configuration-enters-only-through-its-declaration · MUST

Every setting its host hands the program enters it only through its configuration declaration, read only by its declared names.

| Why |
|---|
| a setting read past the declaration, by a name nobody declared, escapes every check and every reader looking for what the program reads, so a typo in its name or its value goes unseen. |

### setting-taken-from-its-most-specific-source · MUST

Every setting its host hands the program from several sources is taken from the most specific source that gives it. A source is more specific than another when it reaches fewer of the program's runs, and a default the program ships with is less specific than every source. Where two sources reach the same runs, the configuration declaration names the one that wins.

| Why |
|---|
| in any other order a broader choice outranks a narrower one, so a value set for one instance or one deployment environment cannot win without the source every other one shares being edited. |

### missing-setting-fails-the-start-of-its-work → outside-value-parsed-once-where-it-enters · MUST

Every missing or malformed setting fails the start of the work that needs it, before that work begins. A setting is missing when its declaration requires it and its host hands it none. Such work is the program, a subcommand or the part that reads the setting.

| Why |
|---|
| a setting checked where it is first used fails in the middle of a request, long after the deployment that broke it — fail fast. |

## Changes while it runs

### changed-configuration-applied-whole-or-refused · MUST

While the program runs, the settings its host hands it change only as a whole set its declaration checked. A changed set is checked whole and swapped in at once, and a set that fails is refused, the last valid set kept.

| Why |
|---|
| a changed value applied in part or unchecked runs the program on a state no start validated. |

### operation-keeps-the-configuration-it-started-with · MUST

Every operation runs to its end on the configuration set it started with.

| Why |
|---|
| an operation that sees two sets mixes them, and does what neither set meant. |

### setting-changes-live-only-where-declared · MUST

While the program runs, every setting its host hands it changes only where its declaration allows it. One that sized or opened something at start, such as a pool, a listening address or a storage path, takes a restart.

| Why |
|---|
| a setting changed under something it sized or opened at start leaves that thing as it was while the program reports the new value. |
