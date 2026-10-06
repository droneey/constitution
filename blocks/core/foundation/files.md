# Files

## generated-files-marked-never-edited · MUST
A file a tool produces carries `.gen` in its name or sits in a folder named `*.gen/`, and is never edited by hand; a change goes to its source, and the file is regenerated.

| Why | Check | Tags |
|---|---|---|
| a hand edit to a generated file is lost at the next generation, and the mark tells every reader and tool not to touch it. | review | [] |

## kebab-case-file-names · MUST
Files and folders are named in kebab-case. A name whose form is fixed outside the project keeps that form: a root file the convention names in upper case — `README.md`, `LICENSE.md`, `SECURITY.md` —, a source file in the case its language sets, and a file or folder a tool finds by its name, such as a router's `__root` route or `__tests__/`. The block of that language or tool names the form.

| Why | Check | Tags |
|---|---|---|
| one case removes a decision from every new file and keeps names portable across file systems. | tool/names | [] |

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
A folder holds one purpose, said in one phrase without "and", and is split only to separate purposes already mixed.

| Why | Check | Tags |
|---|---|---|
| a folder of two purposes gives a new file two places to go, and a reader two things to tell apart. | review | [] |

## folder-appears-with-its-first-file · SHOULD
A folder appears when its first file does, never ahead of what it will hold.

| Why | Check | Tags |
|---|---|---|
| a folder made for files that do not exist yet shows a part the program does not have, and its name guesses at a purpose before the code has one. | review | [] |

## set-folder-holds-only-members · SHOULD
Files of one kind that arrive one at a time — one per vendor, command, rule or section — live in a folder named for the member in the plural, and nothing else lives there. Their contract, registry and runner sit beside that folder.

| Why | Check | Tags |
|---|---|---|
| adding a member is then adding a file, and no one has to tell members from machinery by their names. | review | [] |
