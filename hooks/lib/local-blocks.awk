# A local block's front matter and its rule headings are read: its rules are not
# in the index (spec §4.3), so only a heading's slug and parent are known. A
# file is opened only when the hook's "local file <path>" record says it is
# regular and readable.

function unquote(v,   c, n) {
  c = substr(v, 1, 1)
  n = length(v)
  if ((c == "\"" || c == "'") && n >= 2 && substr(v, n, 1) == c) return substr(v, 2, n - 2)
  return v
}

# A list becomes words separated by one space, as the index writes lists.
function front_matter_value(v,   n, a, k, out, item) {
  v = trim(v)
  if (v == "null" || v == "~") return ""
  if (v !~ /^\[.*\]$/) return unquote(v)
  n = split(substr(v, 2, length(v) - 2), a, ",")
  out = ""
  for (k = 1; k <= n; k++) {
    item = unquote(trim(a[k]))
    if (item != "") out = out (out == "" ? "" : " ") item
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

function local_layer(path, key,   l) {
  for (l = 1; l <= 4; l++) if (index(path, "./rules/" FOLDER[layers[l]] "/") == 1) return layers[l]
  return LAYER_OF[key]
}

function local_block(s, i,   path, key, name, r, n, a, k, missing, layer) {
  path = ITEXT[i]
  key = IKEY[i]
  if (path !~ /^\.\// || path ~ /(^|\/)\.\.(\/|$)/) {
    warn("local-block", path " is not inside the repository — name a file under ./rules/")
    return
  }
  if (path !~ /\.md$/) {
    warn("local-block", path " is not a block file — name the block's .md file")
    return
  }
  name = path
  sub(/^.*\//, "", name)
  name = substr(name, 1, length(name) - 3)
  if (FILE_STATE[path] == "other") {
    warn("local-block", path " is not a file — name the block's .md file")
    return
  }
  if (FILE_STATE[path] == "unreadable") {
    warn("local-block", path " cannot be read — make it readable")
    return
  }
  r = (FILE_STATE[path] == "file") ? front_matter(ENVIRON["CONSTITUTION_PROJECT"] "/" substr(path, 3)) : 0
  if (r == 0) {
    warn("local-block", path " does not exist — create it or remove it from " key)
    return
  }
  if (r < 0) {
    warn("local-block", path " has no front matter — open it with the block's manifest between --- lines")
    return
  }
  missing = ""
  n = split(FIELDS, a, " ")
  for (k = 1; k <= n; k++) if (!(a[k] in FM)) missing = missing (missing == "" ? "" : ", ") a[k]
  if (missing != "") warn("local-block", path " has no " missing " — fix its front matter")
  layer = local_layer(path, key)
  if (layer != LAYER_OF[key]) warn("wrong-key", name " is " ARTICLE[layer] " — move it from " key " to " KEY_OF[layer])
  if (("id" in FM) && FM["id"] != name) warn("local-block", path " has id " FM["id"] " — make it " name ", the file's name")
  if (name in KNOWN) {
    warn("local-block", path " repeats the constitution id " name " — rename it")
    return
  }
  if (FM["extends"] != "" && !(FM["extends"] in KNOWN)) warn("local-block", path " extends " FM["extends"] ", which is not a constitution block — fix its front matter")
  n = split(FM["requires"], a, " ")
  for (k = 1; k <= n; k++) if (!(a[k] in KNOWN) && !(a[k] in LOCAL)) warn("local-block", path " requires " a[k] ", which is not a block — fix its front matter")
  check_coverage(path)
  local_rules(ENVIRON["CONSTITUTION_PROJECT"] "/" substr(path, 3))
  LPATH[++nlocal] = path
  LID[nlocal] = name
  LLAYER[nlocal] = layer
  LSUMMARY[nlocal] = FM["summary"]
  LREQUIRES[nlocal] = FM["requires"]
  LEXTENDS[nlocal] = FM["extends"]
  LCHECKS[nlocal] = FM["checks"]
  LLANGS[nlocal] = FM["languages"]
  LROLES[nlocal] = FM["roles"]
  LGOVERNS[nlocal] = FM["governs"]
  LSCOPE[nlocal] = s
  IN[s, name] = 1
  if (FM["extends"] in KNOWN) add_with_bases(s, FM["extends"])
}

# A local block names a language of the constitution or one listed beside it.
function is_language(id) {
  if (id in KNOWN) return LAYER[id] == "language"
  return (id in LOCAL) && local_layer(LOCAL_PATH[id], LOCAL_KEY[id]) == "language"
}

function check_coverage(path,   n, a, k) {
  n = split(FM["languages"], a, " ")
  for (k = 1; k <= n; k++) if (!is_language(a[k])) warn("local-block", path " covers " a[k] ", which is not a language block — fix its front matter")
  n = split(FM["roles"], a, " ")
  for (k = 1; k <= n; k++) if (!(a[k] in FREE)) warn("local-block", path " is held to " a[k] ", which is not a role — fix its front matter")
}

# A rule heading of a local block is "## <slug> · <LEVEL>" or
# "## <slug> → <parent>", with a level after the parent or none. A heading in a
# code fence is an example.
function local_rules(file,   line, r, in_fence, in_front, rest, arrow, at, slug, parent) {
  arrow = " → "
  in_fence = 0
  in_front = 1
  r = (getline line < file)
  sub(/\r$/, "", line)
  if (r <= 0 || line != "---") {
    close(file)
    return
  }
  while ((getline line < file) > 0) {
    sub(/\r$/, "", line)
    if (in_front) {
      if (line == "---") in_front = 0
      continue
    }
    if (line ~ /^(```|~~~)/) {
      in_fence = !in_fence
      continue
    }
    if (in_fence) continue
    if (line ~ /^## [^ ]+ · (MUST|SHOULD|MAY)$/) {
      rest = substr(line, 4)
      LOCAL_RULE[substr(rest, 1, index(rest, " ") - 1)] = 1
    } else if (line ~ /^## [^ ]+ → [^ ]+( · [^ ]+)?$/) {
      rest = substr(line, 4)
      at = index(rest, arrow)
      slug = substr(rest, 1, at - 1)
      parent = substr(rest, at + length(arrow))
      at = index(parent, " ")
      if (at > 0) parent = substr(parent, 1, at - 1)
      LOCAL_RULE[slug] = 1
      LPARENT_SLUG[++nlparents] = slug
      LPARENT_OF[nlparents] = parent
    }
  }
  close(file)
}

# A local rule's parent is a rule of the constitution or of a local block.
function check_local_parents(   k) {
  for (k = 1; k <= nlparents; k++) {
    if (LPARENT_OF[k] in RULE || LPARENT_OF[k] in LOCAL_RULE) continue
    warn("local-block", LPARENT_SLUG[k] " → " LPARENT_OF[k] ": " LPARENT_OF[k] " is an unknown rule — check the slug")
  }
}
