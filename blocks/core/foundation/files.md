# Files

## generated-files-marked-never-edited · MUST
A file a tool produces carries `.gen` in its name or sits in a folder named `*.gen/`, and is never edited by hand; a change goes to its source, and the file is regenerated.

| Why | Check | Tags |
|---|---|---|
| a hand edit to a generated file is lost at the next generation, and the mark tells every reader and tool not to touch it. | review | [] |

## yaml-files-end-in-yaml · SHOULD
A YAML file ends in `.yaml`, never `.yml`, unless a tool reads it only by a fixed name, as a code host may read its issue forms.

| Why | Check | Tags |
|---|---|---|
| one spelling of one format lets every glob, tool and reader find all of them; a name a tool fixes is not the project's to choose. | tool/names | [] |

## folder-named-for-its-purpose · SHOULD
A folder is named for its purpose, what its contents are for, never by a catch-all word: no `helpers`, `misc`, `stuff`, `magic`, or a singular `lib`.

| Why | Check | Tags |
|---|---|---|
| a folder named for what its contents are for tells a reader about the system; one named for their shape tells nothing. | review | [] |

## one-purpose-per-folder · SHOULD
A folder holds one purpose, said in one phrase without "and". It appears to separate purposes already mixed, never for members that do not exist yet.

| Why | Check | Tags |
|---|---|---|
| a folder of two purposes gives a new file two places to go, and a reader two things to tell apart. | review | [] |
