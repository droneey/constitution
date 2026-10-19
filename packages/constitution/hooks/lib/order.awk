# Orders the Markdown files of a folder of blocks as the Constitution's check
# loads them: block by block, by layer and then by id, and in each the passport,
# its chapters by axis, then its seams. Prints a key, a tab and the hook's
# "blockfile" record; sort orders by the key, and an id ends at a byte below any a
# name can hold, so "ui" comes before "ui-kit".

BEGIN {
  FS = "/"
  T = "\t"
  END_ID = sprintf("%c", 1)
  SOURCE = ENVIRON["CONSTITUTION_SOURCE"]
  FOLDER_ = ENVIRON["CONSTITUTION_FOLDER"]
  RANK["foundation"] = 0
  RANK["architecture"] = 1
  RANK["workflow"] = 2
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
  top = substr(name, 1, index(name, "/") - 1)
  if (top in RANK) {
    axis = RANK[top]
    name = substr(name, length(top) + 2)
    role = 1
    if (name ~ /^with\//) {
      role = 2
      name = substr(name, 6)
    }
  } else {
    axis = 0
    role = (name == id ".md") ? 0 : 3
  }
  if (index(name, "/")) role = 3
  print rank id END_ID dir END_ID role axis END_ID name T "blockfile" T SOURCE T path T FOLDER_ "/" path
}
