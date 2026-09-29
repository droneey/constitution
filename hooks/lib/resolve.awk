# Runs with local-blocks.awk. Scope 0 is the whole repository; scope s > 0 is
# application s, which holds scope 0's blocks and its own. Every order comes
# from the index or from constitution.yaml, never from awk's iteration over an
# array, which differs from one awk to the next.

BEGIN {
  FS = "\t"
  T = "\t"
  CODES = "missing abstract unknown wrong-key config local-block no-tool not-met override"
  KEYS = "version axes domains platforms languages implementations apps check overrides"
  FIELDS = "id summary requires extends abstract checks languages roles dictionary governs"
  LAYERS = "domain platform language implementation"
  AXES = "foundation architecture workflow"
  TODAY = ENVIRON["CONSTITUTION_TODAY"]
  split("domains platforms languages implementations", keys, " ")
  split(LAYERS, layers, " ")
  split("Domains Platforms Languages Implementations", titles, " ")
  split("domains contexts/platforms contexts/languages implementations", folders, " ")
  split("a domain|a platform|a language|an implementation", articles, "|")
  for (k = 1; k <= 4; k++) {
    LAYER_OF[keys[k]] = layers[k]
    KEY_OF[layers[k]] = keys[k]
    TITLE[layers[k]] = titles[k]
    FOLDER[layers[k]] = folders[k]
    ARTICLE[layers[k]] = articles[k]
    ADD[keys[k]] = keys[k] ": []"
    FILL[keys[k]] = "write " keys[k] ": []"
  }
  ADD["version"] = "version: " ENVIRON["CONSTITUTION_INSTALLED"]
  ADD["axes"] = "axes: [foundation, architecture, workflow]"
  ADD["apps"] = "apps: {}"
  ADD["check"] = "check: <the command that runs every check, or null>"
  ADD["overrides"] = "overrides: []"
  FILL["version"] = "write version: " ENVIRON["CONSTITUTION_INSTALLED"]
  FILL["axes"] = "write axes: [foundation, architecture, workflow]"
  FILL["apps"] = "write apps: {}"
  FILL["check"] = "name the command that runs every check, or write check: null"
  FILL["overrides"] = "write overrides: []"
  read_index(ENVIRON["CONSTITUTION_INDEX"])
}

function read_index(path,   line, f, r) {
  while ((r = (getline line < path)) > 0) {
    if (substr(line, 1, 1) == "#") continue
    split(line, f, "\t")
    if (f[1] == "role") {
      ROLE[++nroles] = f[2]
      FREE[f[2]] = (f[3] == "true")
    } else if (f[1] == "block") {
      B[++nb] = f[2]
      KNOWN[f[2]] = 1
      LAYER[f[2]] = f[3]
      SUMMARY[f[2]] = f[4]
      CHAPTERS[f[2]] = f[5]
      WITH[f[2]] = f[6]
      REQUIRES[f[2]] = f[7]
      ABSTRACT[f[2]] = f[9]
      HEIRS[f[2]] = f[10]
      CHECKS[f[2]] = f[11]
      LANGS[f[2]] = f[12]
      HELD_TO[f[2]] = f[13]
      ANCESTORS[f[2]] = f[14]
      GOVERNS[f[2]] = f[15]
    } else if (f[1] == "rule") {
      R[++nr] = f[2]
      RULE[f[2]] = nr
      RBLOCK[nr] = f[3]
      RWITH[nr] = f[5]
      RLEVEL[nr] = f[6]
      RCHECK[nr] = f[7]
      RROLE[nr] = f[8]
      RLANGS[nr] = f[9]
      RAXIS[nr] = f[11]
      if (f[12] != "" && f[13] == "false") KIDS[f[12]] = KIDS[f[12]] " " f[2]
      RHEAD[nr] = f[14]
    } else if (f[1] == "answer") {
      ALIB[++nanswers] = f[2]
      AREQ[nanswers] = f[3]
      AMET[nanswers] = f[4]
    }
  }
  if (r < 0) {
    broken = 1
    exit
  }
  close(path)
}

function text(k,   s) {
  s = $0
  while (k-- > 0) s = substr(s, index(s, T) + 1)
  return s
}

function trim(s) {
  sub(/^[ \t]+/, "", s)
  sub(/[ \t]+$/, "", s)
  return s
}

function has(list, word) {
  return index(" " list " ", " " word " ") > 0
}

function join(list, glue,   n, a, k, out) {
  n = split(list, a, " ")
  out = a[1]
  for (k = 2; k <= n; k++) out = out (k == n ? glue : ", ") a[k]
  return out
}

function where(s) {
  return s ? " in " APP[s] : ""
}

function warn(code, message) {
  if ((code, message) in WARNED) return
  WARNED[code, message] = 1
  WARNING[code, ++WARNINGS[code]] = message
}

function add_with_bases(s, id,   n, a, k) {
  IN[s, id] = 1
  n = split(ANCESTORS[id], a, " ")
  for (k = 1; k <= n; k++) IN[s, a[k]] = 1
}

function heirs(id) {
  return HEIRS[id] == "" ? "one of its heirs" : join(HEIRS[id], " or ")
}

function declare(s, i,   name, key) {
  name = ITEXT[i]
  key = IKEY[i]
  if (name ~ /^(\.\.?)?\//) {
    local_block(s, i)
  } else if (!(name in KNOWN)) {
    warn("unknown", name " is not a block — check the name")
  } else if (LAYER[name] == "core") {
    warn("wrong-key", "core is always active — remove it from " key)
  } else if (ABSTRACT[name] == "true") {
    warn("abstract", name " cannot be listed — list " heirs(name))
  } else {
    if (LAYER[name] != LAYER_OF[key]) warn("wrong-key", name " is " ARTICLE[LAYER[name]] " — move it from " key " to " KEY_OF[LAYER[name]])
    add_with_bases(s, name)
  }
}

function check_keys(   n, a, k) {
  n = split(KEYS, a, " ")
  for (k = 1; k <= n; k++) {
    EXPECTED[a[k]] = 1
    if (!(a[k] in SEEN)) warn("config", "constitution.yaml has no " a[k] " key — add " ADD[a[k]])
  }
  for (k = 1; k <= nkeys; k++) if (!(SEENKEY[k] in EXPECTED)) warn("config", "constitution.yaml has the unknown key " SEENKEY[k] " — remove it")
  for (k = 1; k <= nempty; k++) warn("config", (EAPP[k] == "" ? "constitution.yaml" : EAPP[k]) " leaves " EKEY[k] " empty — " FILL[EKEY[k]])
}

function lowered(s, slug) {
  return ((0, slug) in LOWERED) || (s > 0 && ((s, slug) in LOWERED))
}

# An override that is incomplete, names no rule or has expired lowers nothing.
function apply_overrides(   o, s, rule, missing) {
  for (o = 1; o <= nover; o++) {
    rule = ORULE[o]
    missing = ""
    if (rule == "") missing = "rule"
    if (OLEVEL[o] == "") missing = missing (missing == "" ? "" : ", ") "level"
    if (OREASON[o] == "") missing = missing (missing == "" ? "" : ", ") "reason"
    if (missing != "") {
      warn("config", "the override on line " OLINE[o] " has no " missing " — complete it or remove it")
    } else if (OLEVEL[o] != "SHOULD" && OLEVEL[o] != "MAY") {
      warn("config", "the override of " rule " sets the level " OLEVEL[o] " — write SHOULD or MAY")
    } else if (OUNTIL[o] != "" && OUNTIL[o] !~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/) {
      warn("config", "the override of " rule " has until " OUNTIL[o] " — write a date as YYYY-MM-DD")
    } else if (!(rule in RULE)) {
      warn("override", rule " names no rule — check the slug")
    } else if (OUNTIL[o] != "" && OUNTIL[o] "" < TODAY "") {
      warn("override", rule " expired on " OUNTIL[o] " — renew or remove it")
    } else {
      s = (OAPP[o] == "") ? 0 : SCOPE[OAPP[o]]
      LOWERED[s, rule] = 1
      NOTE[rule] = NOTE[rule] (NOTE[rule] == "" ? "" : "; ") OLEVEL[o] where(s)
      LIVE[++nlive] = o
      lower_below(o, s, rule)
    }
  }
}

function lower_below(o, s, parent,   n, a, k) {
  n = split(KIDS[parent], a, " ")
  for (k = 1; k <= n; k++) {
    if ((o, a[k]) in CASCADED) continue
    CASCADED[o, a[k]] = 1
    LOWERED[s, a[k]] = 1
    NOTE[a[k]] = NOTE[a[k]] (NOTE[a[k]] == "" ? "" : "; ") OLEVEL[o] where(s) " via " ORULE[o]
    lower_below(o, s, a[k])
  }
}

function active_rule(s, i) {
  return ON[s, RAXIS[i]] && IN[s, RBLOCK[i]] && (RWITH[i] == "" || IN[s, RWITH[i]])
}

function axes_of(s,   i, n, a, k, named) {
  named = 0
  for (i = 1; i <= nitems; i++) {
    if (IKEY[i] != "axes" || IAPP[i] != (s ? APP[s] : "")) continue
    if (!has(AXES, ITEXT[i])) {
      warn("config", "axes names " ITEXT[i] " — write foundation, architecture or workflow")
      continue
    }
    if (!named++) delete PICKED
    PICKED[ITEXT[i]] = 1
  }
  n = split(AXES, a, " ")
  for (k = 1; k <= n; k++) {
    if (named) ON[s, a[k]] = (a[k] in PICKED)
    else ON[s, a[k]] = s ? ON[0, a[k]] : 1
  }
  if (named && !ON[s, "foundation"]) {
    warn("config", (s ? APP[s] : "constitution.yaml") " leaves foundation out of axes — foundation is always followed, add it")
    ON[s, "foundation"] = 1
  }
}

function all_axes(   n, a, k) {
  n = split(AXES, a, " ")
  for (k = 1; k <= n; k++) ON[0, a[k]] = 1
}

function print_core() {
  if ("core" in KNOWN) print "core" T "Core's files, under blocks/core/: " join(trim("core.md " chapters(0, "core")), ", ") "."
}

function axis_of(entry) {
  return substr(entry, 1, index(entry, "/") - 1)
}

function name_of(entry) {
  return substr(entry, index(entry, "/") + 1)
}

function needs(s, id, list,   n, a, k) {
  n = split(list, a, " ")
  for (k = 1; k <= n; k++) {
    if (IN[s, a[k]]) continue
    if (a[k] in KNOWN) warn("missing", id where(s) " needs " a[k] " — add " ((ABSTRACT[a[k]] == "true") ? heirs(a[k]) : a[k]) " to " KEY_OF[LAYER[a[k]]])
    else if (a[k] in LOCAL) warn("missing", id where(s) " needs " a[k] " — add " LOCAL_PATH[a[k]] " to " LOCAL_KEY[a[k]])
  }
}

function requires_of(s,   j, k) {
  for (j = 1; j <= nb; j++) if (IN[s, B[j]] && !(s > 0 && IN[0, B[j]])) needs(s, B[j], REQUIRES[B[j]])
  for (k = 1; k <= nlocal; k++) if (LSCOPE[k] == s) needs(s, LID[k], LREQUIRES[k])
}

# A tool checks its roles for the languages it names; a tool that names none
# checks only the language-free roles, as the CI's role coverage has it.
function hold(checks, langs, language,   n, a, k) {
  n = split(checks, a, " ")
  for (k = 1; k <= n; k++) if ((langs == "") ? FREE[a[k]] : has(langs, language)) HELD[a[k]] = 1
}

function such_as(language, role,   j, id) {
  for (j = 1; j <= nb; j++) {
    id = B[j]
    if (ABSTRACT[id] != "true" && has(CHECKS[id], role) && ((LANGS[id] == "") ? FREE[role] : has(LANGS[id], language))) return ", such as " id ","
  }
  return ""
}

# A language needs only the roles its files are held to.
function no_tool(s, language, roles,   j, k, i, role) {
  delete HELD
  delete NEEDED
  for (j = 1; j <= nb; j++) if (IN[s, B[j]]) hold(CHECKS[B[j]], LANGS[B[j]], language)
  for (k = 1; k <= nlocal; k++) if (IN[s, LID[k]]) hold(LCHECKS[k], LLANGS[k], language)
  for (i = 1; i <= nr; i++) {
    if (RLEVEL[i] != "MUST" || RCHECK[i] != "tool" || !has(roles, RROLE[i])) continue
    if (active_rule(s, i) && (RLANGS[i] == "" || has(RLANGS[i], language)) && !lowered(s, R[i])) NEEDED[RROLE[i]] = 1
  }
  for (k = 1; k <= nroles; k++) {
    role = ROLE[k]
    if (!(role in NEEDED) || (role in HELD)) continue
    UNCHECKED[s, language, role] = 1
    if (s > 0 && ((0, language, role) in UNCHECKED)) continue
    warn("no-tool", "rules checked by " role " have no tool for " language where(s) " — add one" such_as(language, role) " or override them")
  }
}

function tools_of(s,   j, k) {
  for (j = 1; j <= nb; j++) if (LAYER[B[j]] == "language" && IN[s, B[j]]) no_tool(s, B[j], HELD_TO[B[j]])
  for (k = 1; k <= nlocal; k++) if (LLAYER[k] == "language" && IN[s, LID[k]]) no_tool(s, LID[k], LROLES[k])
}

function answers_of(s,   i, k) {
  for (i = 1; i <= nanswers; i++) {
    if (AMET[i] != "no" || !IN[s, ALIB[i]] || !(AREQ[i] in RULE)) continue
    k = RULE[AREQ[i]]
    if (RLEVEL[k] != "MUST" || !active_rule(s, k) || lowered(s, AREQ[i])) continue
    UNMET[s, i] = 1
    if (s > 0 && ((0, i) in UNMET)) continue
    warn("not-met", ALIB[i] where(s) " does not meet " AREQ[i] " — see its Requirements table")
  }
}

function active_count(   j, s, k, n) {
  n = 0
  for (j = 1; j <= nb; j++) {
    for (s = 0; s <= napps; s++) {
      if (IN[s, B[j]]) {
        n++
        break
      }
    }
  }
  for (k = 1; k <= nlocal; k++) {
    if (!(LID[k] in COUNTED)) n++
    COUNTED[LID[k]] = 1
  }
  return n
}

function chapters(s, id,   out, n, a, k) {
  out = ""
  n = split(CHAPTERS[id], a, " ")
  for (k = 1; k <= n; k++) if (ON[s, axis_of(a[k])]) out = out (out == "" ? "" : " ") a[k]
  return out
}

function seam(entry) {
  return axis_of(entry) "/with/" name_of(entry) ".md"
}

function also(s, id,   out, n, a, k) {
  out = join(chapters(s, id), ", ")
  n = split(WITH[id], a, " ")
  for (k = 1; k <= n; k++) if (ON[s, axis_of(a[k])] && IN[s, name_of(a[k])]) out = out (out == "" ? "" : ", ") seam(a[k])
  return (out == "") ? "" : " Also: " out
}

function local_line(k) {
  return "- " LID[k] " (local, " LPATH[k] "): " LSUMMARY[k]
}

function print_blocks(   l, layer, j, id, k, s, lines) {
  for (l = 1; l <= 4; l++) {
    layer = layers[l]
    lines = 0
    for (j = 1; j <= nb; j++) {
      id = B[j]
      if (LAYER[id] != layer || !IN[0, id]) continue
      if (!lines++) print "index" T "## " TITLE[layer] " (blocks/" FOLDER[layer] "/<id>/<id>.md)"
      print "index" T "- " id ": " SUMMARY[id] also(0, id)
    }
    for (k = 1; k <= nlocal; k++) {
      if (LSCOPE[k] != 0 || LLAYER[k] != layer) continue
      if (!lines++) print "index" T "## " TITLE[layer] " (blocks/" FOLDER[layer] "/<id>/<id>.md)"
      print "index" T local_line(k)
    }
  }
  for (s = 1; s <= napps; s++) {
    lines = 0
    for (j = 1; j <= nb; j++) {
      id = B[j]
      if (LAYER[id] == "core" || !IN[s, id]) continue
      if (IN[0, id]) {
        if (app_only_files(s, id) == "") continue
        if (!lines++) print "index" T "## " APP[s]
        print "index" T "- " id " (" FOLDER[LAYER[id]] "): Also: " app_only_files(s, id)
        continue
      }
      if (!lines++) print "index" T "## " APP[s]
      print "index" T "- " id " (" FOLDER[LAYER[id]] "): " SUMMARY[id] also(s, id)
    }
    for (k = 1; k <= nlocal; k++) {
      if (LSCOPE[k] != s || IN[0, LID[k]]) continue
      if (!lines++) print "index" T "## " APP[s]
      print "index" T local_line(k)
    }
  }
}

function print_overrides(   k, o) {
  if (!nlive) return
  print "index" T "## Overrides"
  for (k = 1; k <= nlive; k++) {
    o = LIVE[k]
    print "index" T "- " ORULE[o] ": " OLEVEL[o] (OAPP[o] == "" ? "" : " in " OAPP[o]) (OUNTIL[o] == "" ? "" : " until " OUNTIL[o])
  }
}

function app_only_files(s, id,   out, n, a, k, b) {
  out = ""
  n = split(CHAPTERS[id], a, " ")
  for (k = 1; k <= n; k++) if (ON[s, axis_of(a[k])] && !ON[0, axis_of(a[k])]) out = out (out == "" ? "" : ", ") a[k]
  n = split(WITH[id], a, " ")
  for (k = 1; k <= n; k++) {
    b = name_of(a[k])
    if (ON[s, axis_of(a[k])] && IN[s, b] && !(IN[0, b] && ON[0, axis_of(a[k])])) out = out (out == "" ? "" : ", ") seam(a[k])
  }
  return out
}

# What the later hooks read from the session's state, so they never resolve
# again: the check command, none for null, and each scope's active blocks with
# the globs they govern and their files.
function print_active(   check, s, j, k) {
  check = VALUE["check"]
  if (check == "null" || check == "~") check = ""
  print "check" T check
  for (s = 0; s <= napps; s++) {
    for (j = 1; j <= nb; j++) if (IN[s, B[j]] && B[j] != "core") print "active" T s T APP[s] T B[j] T GOVERNS[B[j]] T files_of(s, B[j])
    for (k = 1; k <= nlocal; k++) if (IN[s, LID[k]]) print "active" T s T APP[s] T LID[k] T LGOVERNS[k] T LPATH[k]
  }
}

function files_of(s, id,   base, out, n, a, k) {
  base = "blocks/" FOLDER[LAYER[id]] "/" id "/"
  out = base id ".md"
  n = split(chapters(s, id), a, " ")
  for (k = 1; k <= n; k++) out = out " " base a[k]
  n = split(WITH[id], a, " ")
  for (k = 1; k <= n; k++) if (ON[s, axis_of(a[k])] && IN[s, name_of(a[k])]) out = out " " base seam(a[k])
  return out
}

# The headlines are of domains, contexts and implementations, in the index's
# order of layers.
function print_headlines(   i, s) {
  for (i = 1; i <= nr; i++) {
    if (RLEVEL[i] != "MUST" || LAYER[RBLOCK[i]] == "core") continue
    for (s = 0; s <= napps; s++) if (active_rule(s, i)) break
    if (s > napps) continue
    print "headline" T RBLOCK[i] T "- " R[i] ((R[i] in NOTE) ? " (" NOTE[R[i]] ")" : "") ": " RHEAD[i]
  }
}

{ record = $1 }
record == "error" { failed = $2 }
record == "key" {
  SEEN[$2] = 1
  SEENKEY[++nkeys] = $2
}
record == "value" { VALUE[$2] = text(2) }
record == "empty" {
  EAPP[++nempty] = $2
  EKEY[nempty] = $3
}
record == "app" {
  APP[++napps] = $2
  SCOPE[$2] = napps
}
record == "item" {
  IAPP[++nitems] = $2
  IKEY[nitems] = $3
  ITEXT[nitems] = text(3)
}
record == "local" { FILE_STATE[text(2)] = $2 }
record == "override" {
  OAPP[++nover] = $2
  OLINE[nover] = $3
  ORULE[nover] = $4
  OLEVEL[nover] = $5
  OUNTIL[nover] = $6
  OREASON[nover] = text(6)
}

END {
  if (broken) exit 2
  if (failed != "") {
    all_axes()
    print_core()
    print "error" T failed
    exit
  }
  check_keys()
  for (i = 1; i <= nitems; i++) {
    if (ITEXT[i] !~ /^\.\/.*\.md$/) continue
    name = ITEXT[i]
    sub(/^.*\//, "", name)
    name = substr(name, 1, length(name) - 3)
    LOCAL[name] = 1
    LOCAL_PATH[name] = ITEXT[i]
    LOCAL_KEY[name] = IKEY[i]
  }
  if ("core" in KNOWN) IN[0, "core"] = 1
  axes_of(0)
  for (s = 1; s <= napps; s++) axes_of(s)
  print_core()
  for (i = 1; i <= nitems; i++) if (IAPP[i] == "" && IKEY[i] != "axes") declare(0, i)
  for (s = 1; s <= napps; s++) {
    for (j = 1; j <= nb; j++) if (IN[0, B[j]]) IN[s, B[j]] = 1
    for (k = 1; k <= nlocal; k++) if (LSCOPE[k] == 0) IN[s, LID[k]] = 1
    for (i = 1; i <= nitems; i++) if (IAPP[i] == APP[s] && IKEY[i] != "axes") declare(s, i)
  }
  apply_overrides()
  for (s = 0; s <= napps; s++) {
    requires_of(s)
    tools_of(s)
    answers_of(s)
  }
  print "pin" T VALUE["version"]
  print "count" T active_count()
  n = split(CODES, codes, " ")
  for (c = 1; c <= n; c++) for (k = 1; k <= WARNINGS[codes[c]] + 0; k++) print "warning" T "- " codes[c] ": " WARNING[codes[c], k]
  print_blocks()
  print_overrides()
  print_headlines()
  print_active()
}
