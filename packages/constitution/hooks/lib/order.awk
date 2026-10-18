# Orders the Markdown files of a folder of blocks as the Constitution's check
# loads them: block by block, by layer and then by id, and in each the card,
# its chapters by axis with an axis's own card first, then its seams. Prints a
# key, a tab and the hook's "blockfile" record; sort orders by the key, and an
# id ends at a byte below any a name can hold, so "ui" comes before "ui-kit".

BEGIN {
  FS = "/"
  T = "\t"
  END_ID = sprintf("%c", 1)
  SOURCE = ENVIRON["CONSTITUTION_SOURCE"]
  FOLDER_ = ENVIRON["CONSTITUTION_FOLDER"]
}

{
  path = $0
  if ($2 == "core") {
    dir = $1 "/" $2
    id = "core"
    rank = 0
  } else if ($2 == "contexts") {
    dir = $1 "/" $2 "/" $3 "/" $4
    id = $4
    rank = ($3 == "platforms") ? 2 : 3
  } else {
    dir = $1 "/" $2 "/" $3
    id = $3
    rank = ($2 == "domains") ? 1 : 4
  }
  name = substr(path, length(dir) + 2)
  axis = 0
  if (name ~ /^architecture\//) axis = 1
  if (name ~ /^workflow\//) axis = 2
  if (axis) name = substr(name, index(name, "/") + 1)
  role = 1
  if (name ~ /^with\//) {
    role = 2
    name = substr(name, 6)
  } else if (!axis && name == id ".md") {
    role = 0
  }
  if (index(name, "/")) role = 3
  print rank id END_ID dir END_ID role axis (name == id ".md" ? 0 : 1) END_ID name T "blockfile" T SOURCE T path T FOLDER_ "/" path
}
