# Runs before resolve.awk. The hook reads the blocks from their Markdown: the
# Constitution's, then those of each pack the project lists under packs:. A
# "blockfile" record names the source — empty for the Constitution, the pack's
# path for a pack — the file's path inside it and the file, in the order
# order.awk gives.

function unquote(v,   c, n) {
  c = substr(v, 1, 1)
  n = length(v)
  if ((c == "\"" || c == "'") && n >= 2 && substr(v, n, 1) == c) return substr(v, 2, n - 2)
  return v
}

# A flow list becomes its items separated by one space; a comma inside quotes,
# as in "*.{css,scss}", belongs to its item.
function front_matter_value(v,   inner, n, i, c, quote, item, out) {
  v = trim(v)
  if (v == "null" || v == "~") return ""
  if (v !~ /^\[.*\]$/) return unquote(v)
  inner = substr(v, 2, length(v) - 2)
  n = length(inner)
  quote = ""
  item = ""
  out = ""
  for (i = 1; i <= n + 1; i++) {
    c = (i <= n) ? substr(inner, i, 1) : ","
    if (quote != "") {
      if (c == quote) quote = ""
      item = item c
    } else if (c == "\"" || c == "'") {
      quote = c
      item = item c
    } else if (c == ",") {
      item = unquote(trim(item))
      if (item != "") out = out (out == "" ? "" : " ") item
      item = ""
    } else {
      item = item c
    }
  }
  return out
}

function front_matter(file,   line, r, key, value) {
  delete FM
  r = (getline line < file)
  if (r < 0) return 0
  sub(/\r$/, "", line)
  if (r == 0 || line != "---") {
    close(file)
    return -1
  }
  key = ""
  while ((getline line < file) > 0) {
    sub(/\r$/, "", line)
    if (line == "---") {
      close(file)
      return 1
    }
    if (match(line, /^[a-z]+:/)) {
      key = substr(line, 1, RLENGTH - 1)
      FM[key] = front_matter_value(substr(line, RLENGTH + 1))
    } else if (key != "" && line ~ /^[ \t]*- /) {
      value = line
      sub(/^[ \t]*- /, "", value)
      FM[key] = trim(FM[key] " " front_matter_value(value))
    }
  }
  close(file)
  return -1
}

# A problem in the Constitution's own files, which its release checks, or in a
# pack's, which nobody needs to have checked.
function blocks_warn(source, message) {
  warn(source == "" ? "constitution" : "pack", message)
}

function where_of(source, rel) {
  return (source == "" ? ENVIRON["CONSTITUTION_ROOT"] : source) "/" rel
}

function block_layer(rel,   l) {
  if (index(rel, "blocks/core/") == 1) return "core"
  for (l = 1; l <= 4; l++) if (index(rel, "blocks/" FOLDER[layers[l]] "/") == 1) return layers[l]
  return ""
}

function requirement_row(id, line,   n, f, requirement, met) {
  n = split(line, f, "|")
  if (n < 5) return
  requirement = trim(f[2])
  gsub(/`/, "", requirement)
  if (requirement !~ /^[a-z0-9]+(-[a-z0-9]+)*$/) return
  met = trim(f[4])
  ALIB[++nanswers] = id
  AREQ[nanswers] = requirement
  AMET[nanswers] = met
}

# Its rule headings: "### <slug> · <LEVEL>", or "### <slug> → <parent>" with a
# level after the parent or none, which the parent's level then gives; its
# Requirements rows, which an implementation's passport holds. A heading in a
# code fence is an example.
function block_text(source, rel, file, id, name, axis, seam,   line, r, first, in_fence, in_front, in_answers, rest, arrow, dot, at, slug, parent, level) {
  arrow = " → "
  dot = " · "
  first = 1
  in_fence = 0
  in_front = 0
  in_answers = 0
  while ((r = (getline line < file)) > 0) {
    sub(/\r$/, "", line)
    if (first) {
      first = 0
      if (line == "---") {
        in_front = 1
        continue
      }
    }
    if (in_front) {
      if (line == "---") in_front = 0
      continue
    }
    if (line ~ /^(```|~~~)/) {
      in_fence = !in_fence
      continue
    }
    if (in_fence) continue
    if (line ~ /^#{1,2} /) in_answers = (line == "## Requirements")
    if (in_answers && substr(line, 1, 1) == "|") {
      requirement_row(id, line)
      continue
    }
    slug = ""
    parent = ""
    level = ""
    if (line ~ /^### [^ ]+ · (MUST|SHOULD|MAY)$/) {
      rest = substr(line, 5)
      slug = substr(rest, 1, index(rest, " ") - 1)
      level = substr(rest, length(slug) + length(dot) + 1)
    } else if (line ~ /^### [^ ]+ → [^ ]+( · (MUST|SHOULD|MAY))?$/) {
      rest = substr(line, 5)
      at = index(rest, arrow)
      slug = substr(rest, 1, at - 1)
      parent = substr(rest, at + length(arrow))
      at = index(parent, dot)
      if (at > 0) {
        level = substr(parent, at + length(dot))
        parent = substr(parent, 1, at - 1)
      }
    }
    if (slug == "") continue
    if (slug in RULE) {
      blocks_warn(source, where_of(source, rel) " repeats the rule " slug " — the first is used")
      continue
    }
    R[++nr] = slug
    RULE[slug] = nr
    RBLOCK[nr] = id
    RWITH[nr] = seam
    RLEVEL[nr] = level
    RAXIS[nr] = axis
    RPARENT[nr] = parent
    if (parent != "" && level == "") KIDS[parent] = KIDS[parent] " " slug
  }
  if (r < 0) blocks_warn(source, where_of(source, rel) " cannot be read — its rules are left out")
  close(file)
}

function block_file(source, rel, file,   layer, rest, id, name, axis, read) {
  layer = block_layer(rel)
  if (layer == "" || (layer == "core" && source != "")) {
    blocks_warn(source, where_of(source, rel) " is not inside a block folder of a domain, a context or an implementation")
    return
  }
  if (layer == "core") {
    id = "core"
    name = substr(rel, length("blocks/core/") + 1)
  } else {
    rest = substr(rel, length("blocks/" FOLDER[layer] "/") + 1)
    id = substr(rest, 1, index(rest, "/") - 1)
    name = substr(rest, length(id) + 2)
  }
  if (id == "" || ((source, id) in SKIPPED)) return
  if (!(id in SOURCE)) {
    if (id in KNOWN) {
      blocks_warn(source, where_of(source, rel) " repeats the block " id " — the one read first is used")
      SKIPPED[source, id] = 1
      return
    }
    SOURCE[id] = source
    if (source != "") PACK[id] = source
    B[++nb] = id
    KNOWN[id] = 1
    LAYER[id] = layer
  } else if (SOURCE[id] != source) {
    blocks_warn(source, where_of(source, rel) " repeats the block " id " — the one read first is used")
    SKIPPED[source, id] = 1
    return
  }
  if (name == id ".md") {
    read = front_matter(file)
    if (read == 0) {
      blocks_warn(source, where_of(source, rel) " cannot be read — its rules are left out")
      return
    }
    if (read != 1) {
      blocks_warn(source, where_of(source, rel) " has no front matter — the block is read without it")
    } else {
      SUMMARY[id] = FM["summary"]
      REQUIRES[id] = FM["requires"]
      ABSTRACT[id] = FM["abstract"]
      EXTENDS[id] = FM["extends"]
      GOVERNS[id] = FM["governs"]
    }
    block_text(source, rel, file, id, name, "foundation", "")
    return
  }
  axis = substr(name, 1, index(name, "/") - 1)
  rest = substr(name, length(axis) + 2)
  if (!has("foundation " AXES, axis)) {
    blocks_warn(source, where_of(source, rel) " is not a block file — move or remove it")
  } else if (rest ~ /^with\/[^\/]+\.md$/) {
    rest = substr(rest, 6, length(rest) - 8)
    WITH[id] = WITH[id] (WITH[id] == "" ? "" : " ") axis "/" rest
    block_text(source, rel, file, id, rest, axis, rest)
  } else if (rest ~ /^[^\/]+\.md$/) {
    CHAPTERS[id] = CHAPTERS[id] (CHAPTERS[id] == "" ? "" : " ") name
    block_text(source, rel, file, id, name, axis, "")
  } else {
    blocks_warn(source, where_of(source, rel) " is not a block file — move or remove it")
  }
}

function ancestors_of(id,   base) {
  if (id in ANCESTRY) return ANCESTORS[id]
  ANCESTRY[id] = 1
  base = EXTENDS[id]
  if (base == "") return ""
  ANCESTORS[id] = trim(base " " ancestors_of(base))
  return ANCESTORS[id]
}

# Once every file is read: a block's bases through extends, its place among a
# base's heirs, and each rule's level from its parent where it states none.
function finish_blocks(   j, id, i, pass, parent, open, n, a, k) {
  for (j = 1; j <= nb; j++) {
    id = B[j]
    n = split(REQUIRES[id], a, " ")
    for (k = 1; k <= n; k++) if (!(a[k] in KNOWN)) blocks_warn(SOURCE[id], id " requires " a[k] ", which is not a block — fix its front matter")
    if (EXTENDS[id] == "") continue
    if (!(EXTENDS[id] in KNOWN)) {
      blocks_warn(SOURCE[id], id " extends " EXTENDS[id] ", which is not a block — fix its front matter")
      continue
    }
    if (ABSTRACT[EXTENDS[id]] != "true") blocks_warn(SOURCE[id], id " extends " EXTENDS[id] ", a concrete block; a block extends only an abstract base — require it instead")
    HEIRS[EXTENDS[id]] = trim(HEIRS[EXTENDS[id]] " " id)
    ancestors_of(id)
  }
  for (pass = 0; pass < nr; pass++) {
    open = 0
    for (i = 1; i <= nr; i++) {
      if (RLEVEL[i] != "" || RPARENT[i] == "") continue
      parent = RPARENT[i]
      if ((parent in RULE) && RLEVEL[RULE[parent]] != "") RLEVEL[i] = RLEVEL[RULE[parent]]
      else open = 1
    }
    if (!open) break
  }
  for (i = 1; i <= nr; i++) {
    if (RPARENT[i] == "" || (RPARENT[i] in RULE)) continue
    blocks_warn(SOURCE[RBLOCK[i]], R[i] " → " RPARENT[i] ": " RPARENT[i] " is an unknown rule — check the slug")
  }
}

$1 == "blockfile" { block_file($2, $3, substr($0, length($1 $2 $3) + 4)) }
$1 == "pack" { warn("pack", substr($0, 6) " is not installed — run mise install, or check the path") }
