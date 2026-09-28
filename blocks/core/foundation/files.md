# Files

## generated-files-marked-never-edited · MUST
A file a tool produces carries `.gen` in its name or sits in a folder named `*.gen/`, and is never edited by hand; a change goes to its source, and the file is regenerated.
**Why:** a hand edit to a generated file is lost at the next generation, and the mark tells every reader and tool not to touch it.
**Check:** review
**Tags:** architecture, workflow

## yaml-files-end-in-yaml · SHOULD
A YAML file ends in `.yaml`, never `.yml`, unless a tool reads it only by a fixed name, as GitHub reads the issue forms of `.github/ISSUE_TEMPLATE/` and their `config.yml`.
**Why:** one spelling of one format lets every glob, tool and reader find all of them; a name a tool fixes is not the project's to choose.
**Check:** tool — names
**Tags:** naming
