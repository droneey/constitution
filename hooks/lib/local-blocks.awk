# Only a local block's front matter is read: its rules are not in the index
# (spec §4.3). A file is opened only when the hook's "local file <path>" record
# says it is regular and readable.

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
  else if (FM["extends"] != "" && ABSTRACT[FM["extends"]] != "true") warn("local-block", path " extends " FM["extends"] ", a concrete block; a block extends only an abstract base — require it instead")
  n = split(FM["requires"], a, " ")
  for (k = 1; k <= n; k++) if (!(a[k] in KNOWN) && !(a[k] in LOCAL)) warn("local-block", path " requires " a[k] ", which is not a block — fix its front matter")
  check_coverage(path)
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
