# A stage of its own after resolve.awk, whose block, unit, in and lowered records
# it reads; every global is W_-prefixed so another program can share the run.

BEGIN {
  FS = "\t"
  W_T = "\t"
  W_RULE = "configuration-takes-every-part-of-its-blocks"
  W_AXES = "foundation architecture workflow"
  W_WORKSPACE = "workspace"
  W_ARCHIVE = ".droneey/constitution"
  W_TAKES = 1
  W_COPIES = 2
  W_CHAINS = 3
  W_NU = -1
}

function w_trim(s) {
  sub(/^[ \t]+/, "", s)
  sub(/[ \t]+$/, "", s)
  return s
}

function w_has(list, word) {
  return index(" " list " ", " " word " ") > 0
}

function w_rest(k,   s) {
  s = $0
  while (k-- > 0) s = substr(s, index(s, W_T) + 1)
  return s
}

$1 == "block" { W_B[++W_NB] = $2; W_LAYER[$2] = $3; W_POS[$2] = W_NB }
$1 == "unit" {
  W_PATH[$2] = $3
  sub(/\/$/, "", W_PATH[$2])
  W_UNIT_AT[W_PATH[$2]] = $2
  if ($2 > W_NU) W_NU = $2
  n = split($4, w_axes, " ")
  for (k = 1; k <= n; k++) W_ON[$2, w_axes[k]] = 1
}
$1 == "in" { W_IN[$2, $3] = 1 }
$1 == "lowered" && $3 == W_RULE { W_LOWERED[$2] = 1 }
$1 == "file" && $2 != "" { W_PACK[$2] = 1 }
$1 == "file" && index($3, "presets/") == 1 { W_PRESET[++W_NPRESETS] = $3; W_PSOURCE[W_NPRESETS] = $2 }
$1 == "file" && index($3, "templates/project/") == 1 { W_TEMPLATE[++W_NTEMPLATES] = $3; W_TSOURCE[W_NTEMPLATES] = $2 }
$1 == "config" { W_CONFIG[++W_NCONFIGS] = w_rest(1) }

function w_archive_path(source, rel) {
  return (source == "" ? W_ARCHIVE : source) "/" rel
}

function w_source_root(source) {
  return source == "" ? ENVIRON["CONSTITUTION_ROOT"] : ENVIRON["CONSTITUTION_PROJECT"] "/" source
}

# presets/<scope>/<tool>/<axis>/<name>.<ext>; bindings.yaml and plugins/ are read
# by the parts, never named by a project.
function w_read_presets(   k, n, p, name) {
  for (k = 1; k <= W_NPRESETS; k++) {
    n = split(W_PRESET[k], p, "/")
    if (n != 5 || p[5] == "bindings.yaml" || !w_has(W_AXES, p[4])) continue
    name = p[5]
    sub(/\..*$/, "", name)
    if (name == "") continue
    if (!((p[2], p[3]) in W_TOOL)) {
      W_TOOL[p[2], p[3]] = 1
      W_TOOL_SCOPES[p[3]] = W_TOOL_SCOPES[p[3]] " " p[2]
    }
    if (!((p[2], p[3], p[4], name) in W_PART_AT)) W_NAMES_AT[p[2], p[3], p[4]] = W_NAMES_AT[p[2], p[3], p[4]] " " name
    if (name == W_WORKSPACE) W_HAS_WORKSPACE[p[3]] = 1
    W_PART_AT[p[2], p[3], p[4], name] = W_PRESET[k]
    W_PART_FILE[W_PRESET[k]] = w_source_root(W_PSOURCE[k]) "/" W_PRESET[k]
    W_PART_PATH[p[2], p[3], p[4], name] = w_archive_path(W_PSOURCE[k], W_PRESET[k])
  }
}

function w_takes(source, rel,   file, line, found) {
  file = w_source_root(source) "/" rel
  found = 0
  while ((getline line < file) > 0) {
    if (index(line, "<copied parts>")) found = W_COPIES
    else if (index(line, "<chain end>")) found = W_CHAINS
    else if (index(line, "<parts>") && !found) found = W_TAKES
  }
  close(file)
  return found
}

function w_read_templates(   k, rest, scope, block, sep, takes, i) {
  for (k = 1; k <= W_NTEMPLATES; k++) {
    rest = substr(W_TEMPLATE[k], length("templates/project/") + 1)
    scope = substr(rest, 1, index(rest, "/") - 1)
    rest = substr(rest, length(scope) + 2)
    block = substr(rest, 1, index(rest, "/") - 1)
    rest = substr(rest, length(block) + 2)
    if (scope == "" || block == "" || rest == "") continue
    sep = ((scope, block) in W_FRAGMENTS) ? "\n" : ""
    takes = ((scope, block) in W_TOOL) ? w_takes(W_TSOURCE[k], W_TEMPLATE[k]) : 0
    W_FRAGMENTS[scope, block] = W_FRAGMENTS[scope, block] sep rest W_T w_archive_path(W_TSOURCE[k], W_TEMPLATE[k]) W_T takes
    if (!(rest in W_IS_PATH)) {
      W_IS_PATH[rest] = 1
      for (i = ++W_NPATHS; i > 1 && W_PATHS[i - 1] > rest; i--) W_PATHS[i] = W_PATHS[i - 1]
      W_PATHS[i] = rest
    }
    W_GIVES[rest, block] = 1
    if (!takes) continue
    W_TOOL_PATH[block, rest] = 1
    W_TOOL_AT[rest] = W_TOOL_AT[rest] (w_has(W_TOOL_AT[rest], block) ? "" : " " block)
    W_KIND[rest, block] = takes
  }
}

function w_read_chains(   k, p, line, file, target, name) {
  for (k = 1; k <= W_NPRESETS; k++) {
    if (!(W_PRESET[k] in W_PART_FILE) || split(W_PRESET[k], p, "/") != 5 || !((p[3]) in W_CHAIN_TOOL)) continue
    file = W_PART_FILE[W_PRESET[k]]
    name = p[5]
    sub(/\..*$/, "", name)
    while ((getline line < file) > 0) {
      if (line !~ /^extends?[ \t]*=[ \t]*"/) continue
      target = line
      sub(/^[^"]*"/, "", target)
      sub(/".*$/, "", target)
      sub(/^.*\//, "", target)
      sub(/\..*$/, "", target)
      W_LINK[p[2], p[3], p[4], name] = target
    }
    close(file)
  }
}

function w_chain_tools(   key, p) {
  for (key in W_KIND) {
    split(key, p, SUBSEP)
    if (W_KIND[key] == W_CHAINS) W_CHAIN_TOOL[p[2]] = 1
  }
}

function w_unit_name(s) {
  return s ? W_PATH[s] : "."
}

function w_beneath(path, folder) {
  return folder == "" || path == folder || index(path "/", folder "/") == 1
}

function w_parent(folder) {
  if (!index(folder, "/")) return ""
  sub(/\/[^\/]*$/, "", folder)
  return folder
}

function w_owner(folder) {
  for (;;) {
    if (folder in W_UNIT_AT) return W_UNIT_AT[folder]
    if (folder == "") return 0
    folder = w_parent(folder)
  }
}

# A pseudo-unit after the last: the blocks and axes of the listed units joined.
function w_joined(units,   u, n, list, k, s, j, x) {
  u = W_NU + 1
  for (j = 1; j <= W_NB; j++) W_IN[u, W_B[j]] = 0
  for (x = 1; x <= 3; x++) W_ON[u, w_axis(x)] = 0
  n = split(units, list, " ")
  for (k = 1; k <= n; k++) {
    s = list[k]
    for (j = 1; j <= W_NB; j++) if (W_IN[s, W_B[j]]) W_IN[u, W_B[j]] = 1
    for (x = 1; x <= 3; x++) if (W_ON[s, w_axis(x)]) W_ON[u, w_axis(x)] = 1
  }
  return u
}

function w_axis(x,   a) {
  split(W_AXES, a, " ")
  return a[x]
}

function w_scopes(s,   out, j) {
  out = "common"
  for (j = 1; j <= W_NB; j++) if (W_LAYER[W_B[j]] == "language" && W_IN[s, W_B[j]]) out = out " " W_B[j]
  return out
}

function w_parts(s, scope, tool, axis,   out, n, names, k, id, next_id, m, ids, i, j) {
  delete W_TAKEN
  n = split(W_NAMES_AT[scope, tool, axis], names, " ")
  for (k = 1; k <= n; k++) {
    id = names[k]
    if (id == "self" || id == "core" || id == scope || W_IN[s, id]) W_TAKEN[id] = 1
  }
  if (tool in W_CHAIN_TOOL) {
    for (k = 1; k <= n; k++) {
      id = names[k]
      if (!(id in W_TAKEN)) continue
      for (next_id = W_LINK[scope, tool, axis, id]; next_id != "" && !(next_id in W_TAKEN); next_id = W_LINK[scope, tool, axis, next_id]) {
        if ((scope, tool, axis, next_id) in W_PART_AT) W_TAKEN[next_id] = 1
      }
    }
  }
  out = ""
  if ("self" in W_TAKEN && (scope, tool, axis, "self") in W_PART_AT) out = out "\n" scope W_T tool W_T axis W_T "self"
  if ("core" in W_TAKEN && (scope, tool, axis, "core") in W_PART_AT) out = out "\n" scope W_T tool W_T axis W_T "core"
  if (scope != "common" && (scope, tool, axis, scope) in W_PART_AT) out = out "\n" scope W_T tool W_T axis W_T scope
  m = 0
  for (k = 1; k <= n; k++) {
    id = names[k]
    if (id == "self" || id == "core" || id == scope || !(id in W_POS) || !(id in W_TAKEN)) continue
    for (i = ++m; i > 1 && W_POS[ids[i - 1]] > W_POS[id]; i--) ids[i] = ids[i - 1]
    ids[i] = id
  }
  for (j = 1; j <= m; j++) out = out "\n" scope W_T tool W_T axis W_T ids[j]
  return substr(out, 2)
}

# The parts the tool's template at path takes for the units, their blocks and
# axes joined. The root of a workspace runs a tool that has a workspace part only
# for what crosses its packages: there it takes its own part and the workspace's
# on the axes it follows.
function w_expected(units, path, tool, at_root,   key, u, scopes, ns, k, sc, x, list, out, n, t, q, p, workspace_root) {
  key = units SUBSEP path SUBSEP tool SUBSEP at_root
  if (key in W_EXPECTED_CACHE) return W_EXPECTED_CACHE[key]
  u = w_joined(units)
  out = ""
  workspace_root = at_root && W_IN[0, W_WORKSPACE] && (tool in W_HAS_WORKSPACE)
  if (W_IN[u, tool]) {
    ns = split(w_scopes(u), scopes, " ")
    for (k = 1; k <= ns; k++) {
      sc = scopes[k]
      if (!((sc, tool) in W_TOOL) || !w_fragment_at(sc, tool, path)) continue
      for (x = 1; x <= 3; x++) {
        if (!W_ON[u, w_axis(x)]) continue
        list = w_parts(u, sc, tool, w_axis(x))
        n = split(list, t, "\n")
        for (q = 1; q <= n; q++) {
          split(t[q], p, W_T)
          if (workspace_root && p[4] != "self" && p[4] != W_WORKSPACE) continue
          out = out (out == "" ? "" : "\n") t[q]
        }
      }
    }
  }
  W_EXPECTED_CACHE[key] = out
  return out
}

function w_fragment_at(scope, block, path,   n, f, m, a) {
  n = split(W_FRAGMENTS[scope, block], f, "\n")
  for (m = 1; m <= n; m++) {
    split(f[m], a, W_T)
    if (a[1] == path) return 1
  }
  return 0
}

function w_find_folders(   k, path, c, file, folder, s, line, base, n, list, j) {
  for (k = 1; k <= W_NPATHS; k++) {
    base = W_PATHS[k]
    sub(/^.*\//, "", base)
    W_BY_BASE[base] = W_BY_BASE[base] " " W_PATHS[k]
  }
  for (c = 1; c <= W_NCONFIGS; c++) {
    file = W_CONFIG[c]
    base = file
    sub(/^.*\//, "", base)
    n = split(W_BY_BASE[base], list, " ")
    for (j = 1; j <= n; j++) {
      path = list[j]
      if (file != path && substr(file, length(file) - length(path)) != "/" path) continue
      folder = (file == path) ? "" : substr(file, 1, length(file) - length(path) - 1)
      # a template is no configuration, and a hidden folder holds a tool's own state
      if (("/" folder "/") ~ /\/\.|\/templates\/project\//) continue
      w_add_folder(path, folder)
    }
  }
  for (k = 1; k <= W_NPATHS; k++) {
    path = W_PATHS[k]
    for (s = 0; s <= W_NU; s++) {
      file = ENVIRON["CONSTITUTION_PROJECT"] "/" (s ? W_PATH[s] "/" : "") path
      if ((getline line < file) >= 0) w_add_folder(path, W_PATH[s])
      close(file)
    }
  }
}

function w_add_folder(path, folder) {
  if ((path, folder) in W_HAS_FOLDER) return
  W_HAS_FOLDER[path, folder] = 1
  W_FOLDER[path, ++W_NFOLDERS[path]] = folder
}

function w_file(folder, path) {
  return (folder == "" ? "" : folder "/") path
}

function w_content(rel,   path, line, r, out) {
  if (rel in W_CONTENT) return W_CONTENT[rel]
  path = ENVIRON["CONSTITUTION_PROJECT"] "/" rel
  out = ""
  while ((r = (getline line < path)) > 0) {
    sub(/\r$/, "", line)
    out = out line "\n"
  }
  close(path)
  W_CONTENT[rel] = (r < 0) ? "" : out
  return W_CONTENT[rel]
}

function w_comment(line) {
  return line ~ /^[ \t]*(#|\/\/|\/\*|\*)/
}

# The parts of tool a text names by the path of the release or of a pack, as
# "<scope>/<axis>/<name>": in comments too, or in code alone.
function w_named(content, tool, code_only,   key, out, n, lines, k, line, m, scopes, j, prefix, rest, at, before, token, slash, axis, name) {
  key = content SUBSEP tool SUBSEP code_only
  if (key in W_NAMED_CACHE) return W_NAMED_CACHE[key]
  out = ""
  n = split(content, lines, "\n")
  m = split(w_trim(W_TOOL_SCOPES[tool]), scopes, " ")
  for (k = 1; k <= n; k++) {
    line = lines[k]
    if (!index(line, "presets/") || (code_only && w_comment(line))) continue
    for (j = 1; j <= m; j++) {
      prefix = "presets/" scopes[j] "/" tool "/"
      rest = line
      before = ""
      while ((at = index(rest, prefix)) > 0) {
        before = before substr(rest, 1, at - 1)
        rest = substr(rest, at + length(prefix))
        if (!w_anchored(before)) {
          before = before prefix
          continue
        }
        before = before prefix
        match(rest, /^[A-Za-z0-9._\/-]*/)
        token = substr(rest, 1, RLENGTH)
        slash = index(token, "/")
        if (slash == 0) continue
        axis = substr(token, 1, slash - 1)
        name = substr(token, slash + 1)
        if (index(name, "/") || name == "bindings.yaml") continue
        sub(/\..*$/, "", name)
        if (name != "" && !w_has(out, scopes[j] "/" axis "/" name)) out = out " " scopes[j] "/" axis "/" name
      }
    }
  }
  W_NAMED_CACHE[key] = w_trim(out)
  return W_NAMED_CACHE[key]
}

# Whether the text before "presets/" ends with the release's path or a pack's.
function w_anchored(before,   pack, end) {
  end = W_ARCHIVE "/"
  if (substr(before, length(before) - length(end) + 1) == end) return 1
  for (pack in W_PACK) {
    end = pack
    sub(/^\.\//, "", end)
    end = end "/"
    if (substr(before, length(before) - length(end) + 1) == end) return 1
  }
  return 0
}

function w_short(entry,   p) {
  split(entry, p, W_T)
  return p[1] "/" p[3] "/" p[4]
}

function w_rel(entry,   p) {
  split(entry, p, W_T)
  return W_PART_AT[p[1], p[2], p[3], p[4]]
}

# <package> in a part stands for the project's import package.
function w_line_matches(want, got,   m, segs, pos, j, found, last) {
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

function w_part_lines(path,   line, n) {
  n = 0
  delete W_LINES
  while ((getline line < path) > 0) {
    sub(/\r$/, "", line)
    if (line !~ /^[ \t]*$/) W_LINES[++n] = line
  }
  close(path)
  return n
}

# The problems of a tool's copies: each part sits between "# from <path>" and
# "# end <path>", and the lines around the pairs are the project's own.
function w_copy_problems(content, tool, expected,   out, n, lines, k, line, rel, p, key, want, close_at, i, got, between, path) {
  out = ""
  n = split(content, lines, "\n")
  for (k = 1; k <= n; k++) {
    line = lines[k]
    if (line !~ /^[ \t]*#[ \t]*from / || !index(line, "presets/")) continue
    path = w_trim(substr(line, index(line, "from ") + 5))
    rel = substr(path, index(path, "presets/"))
    if (split(rel, p, "/") < 5 || p[3] != tool) continue
    if (!w_anchored(substr(path, 1, index(path, "presets/") - 1))) continue
    if (index(rel, " ") || index(rel, ",")) {
      out = out "; a marker of " tool " says more than its path"
      continue
    }
    key = p[2] "/" p[4] "/" p[5]
    sub(/\..*$/, "", key)
    if (!(rel in W_PART_FILE)) {
      out = out "; holds a copy of " key " the release no longer has"
      continue
    }
    if (!w_has(expected, key)) {
      out = out "; copies " key ", which it does not take"
      continue
    }
    want = w_part_lines(W_PART_FILE[rel])
    for (close_at = k + 1; close_at <= n; close_at++) if (lines[close_at] ~ /^[ \t]*#[ \t]*end / && index(lines[close_at], rel)) break
    if (close_at > n) {
      out = out "; the copy of " key " has no end line"
      continue
    }
    between = 0
    delete W_GOT
    for (i = k + 1; i < close_at; i++) if (lines[i] !~ /^[ \t]*$/) W_GOT[++between] = lines[i]
    got = (between == want)
    for (i = 1; got && i <= want; i++) got = w_line_matches(W_LINES[i], W_GOT[i])
    if (!got) out = out "; the copy of " key " is edited inside"
  }
  return out
}

# A chain's marker lists its links from the first to the end, and the file
# extends the end.
function w_chain_problems(content, tool, entries,   out, n, e, k, p, extends_of, end, seq, ns, cur, marker, lines, nl, j, listed, nlisted, order, i, found_marker, rel_end) {
  n = split(entries, e, "\n")
  if (!n) return ""
  delete W_IN_CHAIN
  for (k = 1; k <= n; k++) {
    split(e[k], p, W_T)
    W_IN_CHAIN[p[4]] = e[k]
    if ((p[1], p[2], p[3], p[4]) in W_LINK) extends_of[W_LINK[p[1], p[2], p[3], p[4]]] = 1
  }
  end = ""
  for (k = 1; k <= n; k++) {
    split(e[k], p, W_T)
    if (!(p[4] in extends_of)) end = p[4]
  }
  if (end == "") return ""
  split(W_IN_CHAIN[end], p, W_T)
  ns = 0
  for (cur = end; cur != "" && (cur in W_IN_CHAIN); cur = W_LINK[p[1], p[2], p[3], cur]) seq[++ns] = cur
  order = ""
  for (i = ns; i >= 1; i--) order = order " " w_short(W_IN_CHAIN[seq[i]])
  order = w_trim(order)
  rel_end = w_rel(W_IN_CHAIN[end])
  nl = split(content, lines, "\n")
  out = ""
  found_marker = 0
  for (j = 1; j <= nl; j++) {
    if (lines[j] !~ /^[ \t]*#[ \t]*from / || !index(lines[j], "presets/" p[1] "/" tool "/")) continue
    found_marker = 1
    marker = w_named(lines[j] "\n", tool, 0)
    if (marker != order && w_has(marker, w_short(W_IN_CHAIN[end]))) out = out "; its marker of " tool " lists the links out of order"
  }
  for (j = 1; j <= nl; j++) {
    if (w_comment(lines[j]) || lines[j] !~ /extends?[ \t]*=/) continue
    if (index(lines[j], "presets/" p[1] "/" tool "/") && !index(lines[j], rel_end)) out = out "; it extends a link of " tool " short of the chain's end"
  }
  return out
}

# For each unit and active tool, the nearest file at or above it that names the
# tool's parts, a file of the unit's own folders below, or the root's when the
# unit inherits the tool; a tool no file names for a unit is wired nowhere.
function w_serve(   s, k, path, tool, tools, nt, folder, found, c, c2, cfolder) {
  for (s = 0; s <= W_NU; s++) {
    if (W_LOWERED[s]) continue
    for (k = 1; k <= W_NPATHS; k++) {
      path = W_PATHS[k]
      nt = split(w_trim(W_TOOL_AT[path]), tools, " ")
      for (c = 1; c <= nt; c++) {
        tool = tools[c]
        if (!W_IN[s, tool] || (s, tool) in W_WIRED) continue
        if (w_expected(s, path, tool, 0) == "") continue
        W_NEEDS[s, tool] = 1
        folder = w_fact(s, path, tool)
        found = folder != SUBSEP
        if (found) W_SERVES[w_file(folder, path), tool] = W_SERVES[w_file(folder, path), tool] " " s
        # the repository's root needs no file of a tool its units configure below it
        for (c2 = 1; !found && c2 <= W_NFOLDERS[path]; c2++) {
          cfolder = W_FOLDER[path, c2]
          if ((cfolder in W_UNIT_AT && s) || !w_beneath(cfolder, W_PATH[s])) continue
          if (w_named(w_content(w_file(cfolder, path)), tool, 0) != "") found = 1
        }
        if (found) W_WIRED[s, tool] = 1
      }
    }
  }
  for (s = 0; s <= W_NU; s++) {
    for (k = 1; k <= W_NB; k++) {
      tool = W_B[k]
      if (!((s, tool) in W_NEEDS) || (s, tool) in W_WIRED) continue
      if (s && W_IN[0, tool] && (0, tool) in W_WIRED) continue
      print "warning" W_T "- wiring: " tool " is wired nowhere for " w_unit_name(s) " — run /constitution:ratify"
    }
  }
}

function w_check(   k, path, j, folder, rel, tools, nt, c, tool, units, owner, problems, at_unit_root, named, code, expected, ne, e, i, key, missing, nmissing, stray, nstray, list, m, any) {
  for (k = 1; k <= W_NPATHS; k++) {
    path = W_PATHS[k]
    for (j = 1; j <= W_NFOLDERS[path]; j++) {
      folder = W_FOLDER[path, j]
      rel = w_file(folder, path)
      if (w_content(rel) == "") continue
      at_unit_root = (folder in W_UNIT_AT)
      owner = w_owner(folder)
      nt = split(w_trim(W_TOOL_AT[path]), tools, " ")
      problems = ""
      missing = ""
      nmissing = 0
      stray = ""
      nstray = 0
      any = 0
      for (c = 1; c <= nt; c++) {
        tool = tools[c]
        named = w_named(w_content(rel), tool, 0)
        if (named == "") continue
        any = 1
        units = w_trim(W_SERVES[rel, tool])
        if (!at_unit_root && !W_LOWERED[owner] && !w_has(units, owner)) units = w_trim(owner " " units)
        if (units == "") continue
        expected = w_expected(units, path, tool, folder == "")
        delete W_EXPECTED_KEYS
        ne = split(expected, e, "\n")
        key = ""
        for (i = 1; i <= ne; i++) {
          W_EXPECTED_KEYS[w_short(e[i])] = 1
          key = key " " w_short(e[i])
          if (!w_has(named, w_short(e[i]))) {
            nmissing++
            if (nmissing <= 3) missing = missing (missing == "" ? "" : ", ") (nt > 1 ? tool ":" : "") w_short(e[i])
          }
        }
        code = w_named(w_content(rel), tool, 1)
        m = split(code, list, " ")
        for (i = 1; i <= m; i++) {
          if (list[i] in W_EXPECTED_KEYS) continue
          nstray++
          if (nstray <= 3) stray = stray (stray == "" ? "" : ", ") (nt > 1 ? tool ":" : "") list[i]
        }
        if (W_KIND[path, tool] == W_COPIES) problems = problems w_copy_problems(w_content(rel), tool, key)
        if (W_KIND[path, tool] == W_CHAINS) problems = problems w_chain_problems(w_content(rel), tool, expected)
      }
      if (!any) continue
      if (!at_unit_root && !(folder in W_UNLISTED)) {
        W_UNLISTED[folder] = 1
        print "warning" W_T "- unlisted: " folder " keeps its own " path " — list it under packages: in constitution.yaml"
      }
      if (nstray) problems = "; names " stray (nstray > 3 ? " and " (nstray - 3) " more" : "") ", which it does not take" problems
      if (nmissing) problems = "; lacks " missing (nmissing > 3 ? " and " (nmissing - 3) " more" : "") problems
      if (problems != "") print "warning" W_T "- wiring: " rel " " substr(problems, 3) " — run /constitution:ratify"
    }
  }
}

function w_names(units,   n, list, k, out) {
  n = split(units, list, " ")
  out = ""
  for (k = 1; k <= n; k++) out = out (out == "" ? "" : ", ") w_unit_name(list[k])
  return out
}

# The units a file at folder serves by its name: the unit it lies in and each
# beneath it with no nearer file of that name.
function w_served_by_name(folder, path,   out, s, f, shadowed) {
  out = " " w_owner(folder) " "
  for (s = 0; s <= W_NU; s++) {
    if (index(out, " " s " ") || !w_beneath(W_PATH[s], folder)) continue
    shadowed = 0
    for (f = W_PATH[s]; f != folder && !shadowed; f = w_parent(f)) {
      if ((path, f) in W_HAS_FOLDER) shadowed = 1
      if (f == "") break
    }
    if (!shadowed) out = out s " "
  }
  return w_trim(out)
}

# The nearest folder at or above the unit whose file of path names the tool's
# parts, or SUBSEP when none does.
function w_fact(s, path, tool,   key, folder) {
  key = s SUBSEP path SUBSEP tool
  if (key in W_FACT) return W_FACT[key]
  for (folder = W_PATH[s]; ; folder = w_parent(folder)) {
    if ((path, folder) in W_HAS_FOLDER && w_named(w_content(w_file(folder, path)), tool, 0) != "") break
    if (folder == "") {
      folder = SUBSEP
      break
    }
  }
  return W_FACT[key] = folder
}

# The units taking a tool that a file serves for it: those whose nearest file
# naming the tool's parts it is, and, of the units no file names them for,
# those it serves by its name.
function w_in_order(units,   out, s) {
  out = ""
  for (s = 0; s <= W_NU; s++) if (w_has(units, s)) out = out " " s
  return w_trim(out)
}

function w_print_units(folder, path, tool, by_name,   out, s, fact) {
  out = ""
  for (s = 0; s <= W_NU; s++) {
    if (!W_IN[s, tool]) continue
    fact = w_fact(s, path, tool)
    if (fact == SUBSEP ? w_has(by_name, s) : fact == folder) out = out " " s
  }
  return w_trim(out)
}

function w_print(   k, path, n, f, j, folder, by_name, units, scoped, all, u, ns, scopes, sc, b, id, frag, nf, a, m, parts, x, list, np, t, q, seen, s) {
  for (k = 1; k <= W_NPATHS; k++) {
    path = W_PATHS[k]
    n = 0
    if (!((path, "") in W_HAS_FOLDER)) f[++n] = ""
    for (j = 1; j <= W_NFOLDERS[path]; j++) f[++n] = W_FOLDER[path, j]
    for (j = 1; j <= n; j++) {
      folder = f[j]
      by_name = w_served_by_name(folder, path)
      all = ""
      for (b = 1; b <= W_NB; b++) {
        id = W_B[b]
        scoped[b] = ""
        if (!((path, id) in W_GIVES)) continue
        units[b] = w_print_units(folder, path, id, by_name)
        if (units[b] == "") continue
        u = w_joined(units[b])
        if (W_IN[u, id]) scoped[b] = " " w_scopes(u) " "
        all = all " " units[b]
      }
      all = w_in_order(all)
      ns = split(w_scopes(w_joined(all)), scopes, " ")
      m = 0
      for (sc = 1; sc <= ns; sc++) {
        for (b = 1; b <= W_NB; b++) {
          id = W_B[b]
          if (!index(scoped[b], " " scopes[sc] " ") || !((scopes[sc], id) in W_FRAGMENTS)) continue
          nf = split(W_FRAGMENTS[scopes[sc], id], frag, "\n")
          for (x = 1; x <= nf; x++) {
            split(frag[x], a, W_T)
            if (a[1] != path) continue
            if (!m++) print "wiring" W_T w_file(folder, path) ((path, folder) in W_HAS_FOLDER ? "" : " (new)") " for " w_names(all) (W_LOWERED[w_owner(folder)] ? " (its overrides lower " W_RULE ")" : "")
            print "wiring" W_T "  " id " " a[2] ((folder != "" && !W_IN[0, id]) ? " (the folder adds it)" : "")
            if (!a[3]) continue
            parts = w_expected(units[b], path, id, folder == "")
            np = split(parts, t, "\n")
            for (q = 1; q <= np; q++) {
              split(t[q], list, W_T)
              if (list[1] == scopes[sc]) print "wiring" W_T "    " W_PART_PATH[list[1], list[2], list[3], list[4]]
            }
          }
        }
      }
    }
  }
  for (s = 0; s <= W_NU; s++) {
    ns = split(w_scopes(s), scopes, " ")
    for (sc = 1; sc <= ns; sc++) {
      for (b = 1; b <= W_NB; b++) {
        id = W_B[b]
        if (!W_IN[s, id] || !((scopes[sc], id) in W_TOOL) || (scopes[sc], id) in W_FRAGMENTS || (scopes[sc], id) in seen) continue
        seen[scopes[sc], id] = 1
        print "wiring" W_T "no template: " scopes[sc] "/" id " — wire presets/" scopes[sc] "/" id "/ from what the tool reads"
      }
    }
  }
}

END {
  if (W_NU < 0) exit
  w_read_presets()
  w_read_templates()
  w_chain_tools()
  w_read_chains()
  w_find_folders()
  if (ENVIRON["CONSTITUTION_WIRING"] == "print") w_print()
  else {
    w_serve()
    w_check()
  }
}
