BEGIN {
  FS = "\t"
  LIMIT = 300
  PATH_ = ENVIRON["CONSTITUTION_PATH"]
  REMINDED = ENVIRON["CONSTITUTION_REMINDED"]
  while ((getline line < REMINDED) > 0) DONE[line] = 1
  close(REMINDED)
}

function glob_re(g,   re, n, k, c) {
  re = ""
  n = length(g)
  for (k = 1; k <= n; k++) {
    c = substr(g, k, 1)
    if (substr(g, k, 3) == "**/") {
      re = re "(.*/)?"
      k += 2
    } else if (substr(g, k, 2) == "**") {
      re = re ".*"
      k++
    } else if (c == "*") re = re "[^/]*"
    else if (c == "?") re = re "[^/]"
    else if (c == "{") re = re "("
    else if (c == "}") re = re ")"
    else if (c == "," && braces(g, k)) re = re "|"
    else if (index(".+^$|()[]\\", c)) re = re "\\" c
    else re = re c
  }
  return "^" re "$"
}

function braces(g, k,   open, j) {
  open = 0
  for (j = 1; j < k; j++) {
    if (substr(g, j, 1) == "{") open++
    else if (substr(g, j, 1) == "}") open--
  }
  return open > 0
}

function governed(path, globs,   n, a, k) {
  n = split(globs, a, " ")
  for (k = 1; k <= n; k++) if (path ~ glob_re(a[k])) return 1
  return 0
}

$1 == "project" { project = $2 }
$1 == "active" {
  N++
  SCOPE[N] = $2
  APPPATH[N] = $3
  ID[N] = $4
  GLOBS[N] = $5
  FILES[N] = $6
}
$1 == "headline" {
  slug = $3
  sub(/^- /, "", slug)
  sub(/[ :(].*$/, "", slug)
  MUSTS[$2] = MUSTS[$2] (MUSTS[$2] == "" ? "" : ", ") slug
}

END {
  if (project == "" || N == 0) exit
  path = PATH_
  if (substr(path, 1, 1) == "/") {
    if (index(path, project "/") != 1) exit
    path = substr(path, length(project) + 2)
  }
  sub(/^\.\//, "", path)
  scope = 0
  depth = -1
  for (i = 1; i <= N; i++) {
    if (SCOPE[i] == 0 || APPPATH[i] == "") continue
    if (index(path "/", APPPATH[i] "/") == 1 && length(APPPATH[i]) > depth) {
      scope = SCOPE[i]
      depth = length(APPPATH[i])
    }
  }
  inner = (scope == 0) ? path : substr(path, depth + 2)
  for (i = 1; i <= N; i++) {
    if (SCOPE[i] != scope || (ID[i] in DONE) || !governed(inner, GLOBS[i])) continue
    note = ID[i] " governs " path ": read " FILES[i] (MUSTS[ID[i]] == "" ? "" : "; its MUST rules: " MUSTS[ID[i]]) "."
    if (length(note) > LIMIT) note = substr(note, 1, LIMIT - 3) "..."
    NOTE[++notes] = note
    DONE[ID[i]] = 1
    print ID[i] >> REMINDED
  }
  if (!notes) exit
  printf "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\""
  for (k = 1; k <= notes; k++) printf "%s%s", (k > 1 ? "\\n" : ""), json(NOTE[k])
  printf "\"}}\n"
}
