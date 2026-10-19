# Runs after resolve.awk, in the same process, and reads its arrays.

BEGIN {
  WIRING_RULE = "configuration-takes-every-part-of-its-blocks"
  WIRING_AXES = "foundation architecture workflow"
  WORKSPACE = "workspace"
  ARCHIVE_PATH = ".droneey/constitution"
  TAKES = 1
  COPIES = 2
  CHAINS = 3
}

$1 == "file" && index($3, "presets/") == 1 { PRESET[++npresets] = $3; PSOURCE[npresets] = $2 }
$1 == "file" && index($3, "templates/project/") == 1 { TEMPLATE[++ntemplates] = $3; TSOURCE[ntemplates] = $2 }
$1 == "config" { CONFIG[++nconfigs] = text(1) }

function archive_path(source, rel) {
  return (source == "" ? ARCHIVE_PATH : source) "/" rel
}

function source_root(source) {
  return source == "" ? ENVIRON["CONSTITUTION_ROOT"] : ENVIRON["CONSTITUTION_PROJECT"] "/" source
}

# presets/<scope>/<tool>/<axis>/<name>.<ext>; bindings.yaml and plugins/ are read
# by the parts, never named by a project.
function read_presets(   k, n, p, name) {
  for (k = 1; k <= npresets; k++) {
    n = split(PRESET[k], p, "/")
    if (n != 5 || p[5] == "bindings.yaml" || !has(WIRING_AXES, p[4])) continue
    name = p[5]
    sub(/\..*$/, "", name)
    if (name == "") continue
    if (!((p[2], p[3]) in TOOL)) {
      TOOL[p[2], p[3]] = 1
      TOOL_SCOPES[p[3]] = TOOL_SCOPES[p[3]] " " p[2]
    }
    if (!((p[2], p[3], p[4], name) in PART_AT)) NAMES_AT[p[2], p[3], p[4]] = NAMES_AT[p[2], p[3], p[4]] " " name
    PART_AT[p[2], p[3], p[4], name] = PRESET[k]
    PART_FILE[PRESET[k]] = source_root(PSOURCE[k]) "/" PRESET[k]
    PART_PATH[p[2], p[3], p[4], name] = archive_path(PSOURCE[k], PRESET[k])
  }
}

function takes_parts(source, rel,   file, line, found) {
  file = source_root(source) "/" rel
  found = 0
  while ((getline line < file) > 0) {
    if (index(line, "<copied parts>")) found = COPIES
    else if (index(line, "<chain end>")) found = CHAINS
    else if (index(line, "<parts>") && !found) found = TAKES
  }
  close(file)
  return found
}

function read_templates(   k, rest, scope, block, sep, takes, i) {
  for (k = 1; k <= ntemplates; k++) {
    rest = substr(TEMPLATE[k], length("templates/project/") + 1)
    scope = substr(rest, 1, index(rest, "/") - 1)
    rest = substr(rest, length(scope) + 2)
    block = substr(rest, 1, index(rest, "/") - 1)
    rest = substr(rest, length(block) + 2)
    if (scope == "" || block == "" || rest == "") continue
    sep = ((scope, block) in FRAGMENTS) ? "\n" : ""
    takes = ((scope, block) in TOOL) ? takes_parts(TSOURCE[k], TEMPLATE[k]) : 0
    FRAGMENTS[scope, block] = FRAGMENTS[scope, block] sep rest "\t" archive_path(TSOURCE[k], TEMPLATE[k]) "\t" takes
    if (!(rest in IS_PATH)) {
      IS_PATH[rest] = 1
      for (i = ++npaths; i > 1 && PATHS[i - 1] > rest; i--) PATHS[i] = PATHS[i - 1]
      PATHS[i] = rest
    }
    if (takes == COPIES) COPY[rest, block] = 1
    if (takes == CHAINS) CHAIN[scope, block] = 1
  }
}

function read_chains(   k, p, line, file, target) {
  for (k = 1; k <= npresets; k++) {
    if (!(PRESET[k] in PART_FILE) || split(PRESET[k], p, "/") != 5 || !((p[2], p[3]) in CHAIN)) continue
    file = PART_FILE[PRESET[k]]
    sub(/\..*$/, "", p[5])
    while ((getline line < file) > 0) {
      if (line !~ /^extends?[ \t]*=[ \t]*"/) continue
      target = line
      sub(/^[^"]*"/, "", target)
      sub(/".*$/, "", target)
      sub(/^.*\//, "", target)
      sub(/\..*$/, "", target)
      LINK[p[2], p[3], p[4], p[5]] = target
    }
    close(file)
  }
}

function unit_name(s) {
  return s ? APP[s] : "."
}

function unit_path(s,   app) {
  app = s ? APP[s] : ""
  sub(/\/$/, "", app)
  return app
}

function beneath(path, folder) {
  return folder == "" || path == folder || index(path "/", folder "/") == 1
}

function owner_of(folder,   s, best) {
  best = 0
  for (s = 1; s <= napps; s++) if (beneath(folder, unit_path(s)) && length(unit_path(s)) > length(unit_path(best))) best = s
  return best
}

function served(folder, path,   out, s, k, other, shadowed) {
  out = " " owner_of(folder) " "
  for (s = 0; s <= napps; s++) {
    if (index(out, " " s " ") || !beneath(unit_path(s), folder)) continue
    shadowed = 0
    for (k = 1; k <= NFOLDERS[path]; k++) {
      other = FOLDER[path, k]
      if (other != folder && beneath(other, folder) && beneath(unit_path(s), other)) shadowed = 1
    }
    if (!shadowed) out = out s " "
  }
  return trim(out)
}

function joined(units,   u, n, list, k, s, j, x) {
  u = napps + 1
  for (j = 1; j <= nb; j++) IN[u, B[j]] = 0
  for (x = 1; x <= NAXIS; x++) ON[u, AXIS[x]] = 0
  n = split(units, list, " ")
  for (k = 1; k <= n; k++) {
    s = list[k]
    for (j = 1; j <= nb; j++) if (IN[s, B[j]]) IN[u, B[j]] = 1
    for (x = 1; x <= NAXIS; x++) if (ON[s, AXIS[x]]) ON[u, AXIS[x]] = 1
  }
  return u
}

function scopes_of(s,   out, j) {
  out = "common"
  for (j = 1; j <= nb; j++) if (LAYER[B[j]] == "language" && IN[s, B[j]]) out = out " " B[j]
  return out
}

function parts_of(s, scope, tool, axis,   out, n, names, k, id, next_id, m, ids, i, j) {
  delete TAKEN
  n = split(NAMES_AT[scope, tool, axis], names, " ")
  for (k = 1; k <= n; k++) {
    id = names[k]
    if (id == "self" || id == "core" || id == scope || IN[s, id]) TAKEN[id] = 1
  }
  if ((scope, tool) in CHAIN) {
    for (k = 1; k <= n; k++) {
      id = names[k]
      if (!(id in TAKEN)) continue
      for (next_id = LINK[scope, tool, axis, id]; next_id != "" && !(next_id in TAKEN); next_id = LINK[scope, tool, axis, next_id]) {
        if ((scope, tool, axis, next_id) in PART_AT) TAKEN[next_id] = 1
      }
    }
  }
  out = ""
  if ("self" in TAKEN && (scope, tool, axis, "self") in PART_AT) out = out "\n" scope "\t" tool "\t" axis "\tself"
  if ("core" in TAKEN && (scope, tool, axis, "core") in PART_AT) out = out "\n" scope "\t" tool "\t" axis "\tcore"
  if (scope != "common" && (scope, tool, axis, scope) in PART_AT) out = out "\n" scope "\t" tool "\t" axis "\t" scope
  m = 0
  for (k = 1; k <= n; k++) {
    id = names[k]
    if (id == "self" || id == "core" || id == scope || !(id in POSITION) || !(id in TAKEN)) continue
    for (i = ++m; i > 1 && POSITION[ids[i - 1]] > POSITION[id]; i--) ids[i] = ids[i - 1]
    ids[i] = id
  }
  for (j = 1; j <= m; j++) out = out "\n" scope "\t" tool "\t" axis "\t" ids[j]
  return substr(out, 2)
}

function workspace_only(parts,   n, t, k, out, p) {
  n = split(parts, t, "\n")
  out = ""
  for (k = 1; k <= n; k++) {
    split(t[k], p, "\t")
    if (p[4] == "self" || p[4] == WORKSPACE) out = out (out == "" ? "" : "\n") t[k]
  }
  return out
}

function wire(slot, u, path, at_root,   scopes, ns, sc, k, j, id, f, n, m, a, x, axis, list, parts) {
  SLOT_N[slot] = 0
  SLOT_TOOLS[slot] = ""
  SLOT_OWNERS[slot] = ""
  ns = split(scopes_of(u), scopes, " ")
  for (k = 1; k <= ns; k++) {
    sc = scopes[k]
    for (j = 1; j <= nb; j++) {
      id = B[j]
      if (!IN[u, id] || !((sc, id) in FRAGMENTS)) continue
      n = split(FRAGMENTS[sc, id], f, "\n")
      for (m = 1; m <= n; m++) {
        split(f[m], a, "\t")
        if (a[1] != path) continue
        parts = ""
        if (a[3]) {
          for (x = 1; x <= NAXIS; x++) {
            axis = AXIS[x]
            if (!ON[u, axis]) continue
            list = parts_of(u, sc, id, axis)
            if (list != "") parts = parts (parts == "" ? "" : "\n") list
          }
          # the root of a workspace runs such a tool only for what crosses its packages
          if (at_root && IN[0, WORKSPACE] && index("\t" parts "\n", "\t" WORKSPACE "\n")) parts = workspace_only(parts)
          if (!has(SLOT_TOOLS[slot], id)) {
            SLOT_TOOLS[slot] = SLOT_TOOLS[slot] " " id
            SLOT_PARTS[slot, id] = ""
          }
          SLOT_PARTS[slot, id] = SLOT_PARTS[slot, id] (SLOT_PARTS[slot, id] == "" ? "" : "\n") parts
        }
        if (!has(SLOT_OWNERS[slot], id)) SLOT_OWNERS[slot] = SLOT_OWNERS[slot] " " id
        SLOT_N[slot]++
        SLOT_BLOCK[slot, SLOT_N[slot]] = id
        SLOT_TEMPLATE[slot, SLOT_N[slot]] = a[2]
        SLOT_FRAGMENT_PARTS[slot, SLOT_N[slot]] = parts
      }
    }
  }
}

function find_folders(   k, path, c, file, folder, s) {
  for (k = 1; k <= npaths; k++) {
    path = PATHS[k]
    for (c = 1; c <= nconfigs; c++) {
      file = CONFIG[c]
      if (file != path && substr(file, length(file) - length(path)) != "/" path) continue
      folder = (file == path) ? "" : substr(file, 1, length(file) - length(path) - 1)
      # a template is no configuration, and a hidden folder holds a tool's own state
      if (("/" folder "/") ~ /\/\.|\/templates\/project\//) continue
      add_folder(path, folder)
    }
    for (s = 0; s <= napps; s++) {
      file = ENVIRON["CONSTITUTION_PROJECT"] "/" (s ? unit_path(s) "/" : "") path
      if ((getline c < file) >= 0) add_folder(path, unit_path(s))
      close(file)
    }
  }
}

function add_folder(path, folder) {
  if ((path, folder) in HAS_FOLDER) return
  HAS_FOLDER[path, folder] = 1
  FOLDER[path, ++NFOLDERS[path]] = folder
}

function part_path(entry,   p) {
  split(entry, p, "\t")
  return PART_PATH[p[1], p[2], p[3], p[4]]
}

function names_of(units,   n, list, k, out) {
  n = split(units, list, " ")
  out = ""
  for (k = 1; k <= n; k++) out = out (out == "" ? "" : ", ") unit_name(list[k])
  return out
}

function print_wiring(   k, path, n, f, folder, units, u, m, np, t, q, id, seen, s, j, sc, ns, scopes, notemplate) {
  for (k = 1; k <= npaths; k++) {
    path = PATHS[k]
    n = 0
    if (!((path, "") in HAS_FOLDER)) f[++n] = ""
    for (j = 1; j <= NFOLDERS[path]; j++) f[++n] = FOLDER[path, j]
    for (j = 1; j <= n; j++) {
      folder = f[j]
      units = served(folder, path)
      u = joined(units)
      wire(1, u, path, folder == "")
      if (!SLOT_N[1]) continue
      print "wiring" T (folder == "" ? "" : folder "/") path ((path, folder) in HAS_FOLDER ? "" : " (new)") " for " names_of(units) (lowered(owner_of(folder), WIRING_RULE) ? " (its overrides lower " WIRING_RULE ")" : "")
      for (m = 1; m <= SLOT_N[1]; m++) {
        id = SLOT_BLOCK[1, m]
        print "wiring" T "  " id " " SLOT_TEMPLATE[1, m] ((folder != "" && !IN[0, id]) ? " (the folder adds it)" : "")
        np = split(SLOT_FRAGMENT_PARTS[1, m], t, "\n")
        for (q = 1; q <= np; q++) if (t[q] != "") print "wiring" T "    " part_path(t[q])
      }
    }
  }
  for (s = 0; s <= napps; s++) {
    ns = split(scopes_of(s), scopes, " ")
    for (j = 1; j <= ns; j++) {
      sc = scopes[j]
      for (m = 1; m <= nb; m++) {
        id = B[m]
        if (!IN[s, id] || !((sc, id) in TOOL) || (sc, id) in FRAGMENTS || (sc, id) in seen) continue
        seen[sc, id] = 1
        print "wiring" T "no template: " sc "/" id " — wire presets/" sc "/" id "/ from what the tool reads"
      }
    }
  }
}

function read_file(path,   line, r, out) {
  out = ""
  while ((r = (getline line < path)) > 0) out = out line "\n"
  close(path)
  return (r < 0) ? "" : out
}

function named_parts(content, tool,   out, n, scopes, k, prefix, rest, at, token, slash, axis, name) {
  out = ""
  n = split(trim(TOOL_SCOPES[tool]), scopes, " ")
  for (k = 1; k <= n; k++) {
    prefix = "presets/" scopes[k] "/" tool "/"
    rest = content
    while ((at = index(rest, prefix)) > 0) {
      rest = substr(rest, at + length(prefix))
      match(rest, /^[A-Za-z0-9._\/-]*/)
      token = substr(rest, 1, RLENGTH)
      slash = index(token, "/")
      if (slash == 0) continue
      axis = substr(token, 1, slash - 1)
      name = substr(token, slash + 1)
      if (index(name, "/") || name == "bindings.yaml") continue
      sub(/\..*$/, "", name)
      if (name != "" && !index(" " out " ", " " scopes[k] "/" axis "/" name " ")) out = out " " scopes[k] "/" axis "/" name
    }
  }
  return trim(out)
}

# <package> in a part stands for the project's import package.
function line_matches(want, got,   m, segs, pos, j, found, last) {
  if (!index(want, "<package>")) return want == got
  m = split(want, segs, "<package>")
  if (substr(got, 1, length(segs[1])) != segs[1]) return 0
  pos = length(segs[1]) + 1
  for (j = 2; j < m; j++) {
    found = index(substr(got, pos + 1), segs[j])
    if (!found) return 0
    pos = pos + found + length(segs[j])
  }
  last = segs[m]
  return length(got) - length(last) >= pos && substr(got, length(got) - length(last) + 1) == last
}

function part_lines(path,   line, n) {
  n = 0
  delete LINES
  while ((getline line < path) > 0) if (line !~ /^[ \t]*$/) LINES[++n] = line
  close(path)
  return n
}

# A copy sits between "# from <path>" and "# end <path>"; the lines around the
# pair are the project's own.
function stale_copy(content, path, tool,   n, lines, k, rel, p, want, close_at, i, got, between) {
  if (!((path, tool) in COPY)) return 0
  n = split(content, lines, "\n")
  for (k = 1; k <= n; k++) {
    if (lines[k] !~ /^[ \t]*#[ \t]*from / || !index(lines[k], "presets/")) continue
    rel = substr(lines[k], index(lines[k], "presets/"))
    sub(/[ \t]+$/, "", rel)
    if (!(rel in PART_FILE) || split(rel, p, "/") != 5 || p[3] != tool) continue
    want = part_lines(PART_FILE[rel])
    for (close_at = k + 1; close_at <= n; close_at++) if (lines[close_at] ~ /^[ \t]*#[ \t]*end / && index(lines[close_at], rel)) break
    between = 0
    delete GOT
    for (i = k + 1; i < close_at; i++) if (lines[i] !~ /^[ \t]*$/) GOT[++between] = lines[i]
    got = (close_at <= n && between == want)
    for (i = 1; got && i <= want; i++) got = line_matches(LINES[i], GOT[i])
    if (!got) return 1
  }
  return 0
}

function short(entry,   p) {
  split(entry, p, "\t")
  return p[1] "/" p[3] "/" p[4]
}

function check_file(rel, path, slot, at_unit_root,   content, tools, n, k, tool, named, ne, e, key, missing, nmissing, stray, nstray, list, m, i, any, problems, copies, owners) {
  content = read_file(ENVIRON["CONSTITUTION_PROJECT"] "/" rel)
  if (content == "") return
  n = split(trim(SLOT_TOOLS[slot]), tools, " ")
  missing = ""
  nmissing = 0
  stray = ""
  nstray = 0
  any = 0
  copies = ""
  for (k = 1; k <= n; k++) {
    tool = tools[k]
    named = named_parts(content, tool)
    if (named == "") continue
    any = 1
    delete EXPECTED
    ne = split(SLOT_PARTS[slot, tool], e, "\n")
    for (i = 1; i <= ne; i++) {
      if (e[i] == "") continue
      key = short(e[i])
      EXPECTED[key] = 1
      if (!has(named, key)) {
        nmissing++
        if (nmissing <= 3) missing = missing (missing == "" ? "" : ", ") (n > 1 ? tool ":" : "") key
      }
    }
    m = split(named, list, " ")
    for (i = 1; i <= m; i++) {
      if (list[i] in EXPECTED) continue
      nstray++
      if (nstray <= 3) stray = stray (stray == "" ? "" : ", ") (n > 1 ? tool ":" : "") list[i]
    }
    if (stale_copy(content, path, tool)) copies = copies (copies == "" ? "" : ", ") tool
  }
  if (!any) {
    owners = split(trim(SLOT_OWNERS[slot]), list, " ")
    if (at_unit_root && n == 1 && owners == 1) print "warning" T "- wiring: " rel " takes no part of the presets — run /constitution:ratify"
    return
  }
  problems = ""
  if (nmissing) problems = "lacks " missing (nmissing > 3 ? " and " (nmissing - 3) " more" : "")
  if (nstray) problems = problems (problems == "" ? "" : "; ") "names " stray (nstray > 3 ? " and " (nstray - 3) " more" : "") ", which it does not take"
  if (copies != "") problems = problems (problems == "" ? "" : "; ") "holds a copy of " copies " the release no longer has"
  if (problems != "") print "warning" T "- wiring: " rel " " problems " — run /constitution:ratify"
}

function check_wiring(   k, path, j, folder, units, s, at_unit_root) {
  for (k = 1; k <= npaths; k++) {
    path = PATHS[k]
    for (j = 1; j <= NFOLDERS[path]; j++) {
      folder = FOLDER[path, j]
      if (lowered(owner_of(folder), WIRING_RULE)) continue
      units = served(folder, path)
      wire(1, joined(units), path, folder == "")
      if (SLOT_TOOLS[1] == "") continue
      at_unit_root = 0
      for (s = 0; s <= napps; s++) if (unit_path(s) == folder) at_unit_root = 1
      check_file((folder == "" ? "" : folder "/") path, path, 1, at_unit_root)
    }
  }
}

END {
  for (j = 1; j <= nb; j++) POSITION[B[j]] = j
  read_presets()
  read_templates()
  read_chains()
  find_folders()
  if (ENVIRON["CONSTITUTION_WIRING"] == "print") print_wiring()
  else check_wiring()
}
