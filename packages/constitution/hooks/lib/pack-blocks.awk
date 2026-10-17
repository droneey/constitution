# Runs with local-blocks.awk and before resolve.awk. A pack is a folder of
# blocks the project lists under packs:, read from its Markdown as the index
# would give it: no pack ships an index, so the hook reads each of its files.
# A file is opened only when the hook's "packfile" record says it is regular
# and readable.

function pack_layer(rel,   l) {
  for (l = 1; l <= 4; l++) if (index(rel, "blocks/" FOLDER[layers[l]] "/") == 1) return layers[l]
  return ""
}

# Its rule headings: "### <slug> · <LEVEL>", or "### <slug> → <parent>" with a
# level after the parent or none, which the parent's level then gives. A
# heading in a code fence is an example.
function pack_rules(file, id, axis, seam,   line, first, in_fence, in_front, rest, arrow, at, slug, parent, level) {
  arrow = " → "
  first = 1
  in_fence = 0
  in_front = 0
  while ((getline line < file) > 0) {
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
    slug = ""
    parent = ""
    level = ""
    if (line ~ /^### [^ ]+ · (MUST|SHOULD|MAY)$/) {
      rest = substr(line, 5)
      slug = substr(rest, 1, index(rest, " ") - 1)
      level = substr(rest, length(slug) + length(" · ") + 1)
    } else if (line ~ /^### [^ ]+ → [^ ]+( · (MUST|SHOULD|MAY))?$/) {
      rest = substr(line, 5)
      at = index(rest, arrow)
      slug = substr(rest, 1, at - 1)
      parent = substr(rest, at + length(arrow))
      at = index(parent, " · ")
      if (at > 0) {
        level = substr(parent, at + length(" · "))
        parent = substr(parent, 1, at - 1)
      }
    }
    if (slug == "") continue
    if (slug in RULE) {
      warn("pack", PACK[id] " repeats the rule " slug " — the first is used")
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
  close(file)
}

function pack_file(pack, rel, file,   layer, rest, id, name, axis) {
  layer = pack_layer(rel)
  if (layer == "") {
    warn("pack", pack "/" rel " is not inside a block folder of a domain, a context or an implementation")
    return
  }
  rest = substr(rel, length("blocks/" FOLDER[layer] "/") + 1)
  id = substr(rest, 1, index(rest, "/") - 1)
  name = substr(rest, length(id) + 2)
  if (id == "" || ((pack, id) in PACK_SKIPPED)) return
  if (!(id in PACK)) {
    if (id in KNOWN) {
      warn("pack", pack " repeats the block " id " — the one read first is used")
      PACK_SKIPPED[pack, id] = 1
      return
    }
    PACK[id] = pack
    B[++nb] = id
    KNOWN[id] = 1
    LAYER[id] = layer
  } else if (PACK[id] != pack) {
    warn("pack", pack " repeats the block " id " — the one read first is used")
    PACK_SKIPPED[pack, id] = 1
    return
  }
  if (name == id ".md") {
    if (front_matter(file) != 1) {
      warn("pack", pack "/" rel " has no front matter — the block is read without its card")
    } else {
      SUMMARY[id] = FM["summary"]
      REQUIRES[id] = FM["requires"]
      ABSTRACT[id] = FM["abstract"]
      PACK_EXTENDS[id] = FM["extends"]
      GOVERNS[id] = FM["governs"]
    }
    pack_rules(file, id, "", "")
  } else if (name ~ /^with\/[^\/]+\.md$/) {
    name = substr(name, 6, length(name) - 8)
    WITH[id] = WITH[id] (WITH[id] == "" ? "" : " ") name
    pack_rules(file, id, "", name)
  } else if (name ~ /^(architecture|workflow)\/with\/[^\/]+\.md$/) {
    axis = substr(name, 1, index(name, "/") - 1)
    name = substr(name, length(axis) + 7, length(name) - length(axis) - 9)
    WITH[id] = WITH[id] (WITH[id] == "" ? "" : " ") axis "/" name
    pack_rules(file, id, axis, name)
  } else if (name ~ /^(architecture|workflow)\/[^\/]+\.md$/ || name ~ /^[^\/]+\.md$/) {
    CHAPTERS[id] = CHAPTERS[id] (CHAPTERS[id] == "" ? "" : " ") name
    pack_rules(file, id, (name ~ /\//) ? substr(name, 1, index(name, "/") - 1) : "", "")
  } else {
    warn("pack", pack "/" rel " is not a block file — move or remove it")
  }
}

function pack_ancestors(id,   base) {
  if (id in PACK_ANCESTRY) return ANCESTORS[id]
  PACK_ANCESTRY[id] = 1
  base = PACK_EXTENDS[id]
  if (base == "") return ""
  ANCESTORS[id] = trim(base " " ((base in PACK) ? pack_ancestors(base) : ANCESTORS[base]))
  return ANCESTORS[id]
}

# Once every file is read: a block's bases through extends, its place among a
# base's heirs, and each rule's level from its parent where it states none.
function finish_packs(   j, id, i, pass, parent, open) {
  for (j = 1; j <= nb; j++) {
    id = B[j]
    if (!(id in PACK) || PACK_EXTENDS[id] == "") continue
    HEIRS[PACK_EXTENDS[id]] = trim(HEIRS[PACK_EXTENDS[id]] " " id)
    pack_ancestors(id)
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
    warn("pack", R[i] " → " RPARENT[i] ": " RPARENT[i] " is an unknown rule — check the slug")
  }
}

$1 == "packfile" { pack_file($2, $3, substr($0, length($1 $2 $3) + 4)) }
$1 == "pack" { warn("pack", substr($0, 6) " is not installed — run mise install, or check the path") }
