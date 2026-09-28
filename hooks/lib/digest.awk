# The budgets count bytes: under the hook's LC_ALL=C, length() and substr() work
# on bytes in every awk.

BEGIN {
  FS = "\t"
  T = "\t"
  BUDGET = 9400
  WARNING_BUDGET = 1000
  # Kept free for the lines that say what was left out.
  RESERVE = 200
  for (k = 1; k < 32; k++) ESCAPE[sprintf("%c", k)] = sprintf("\\u%04x", k)
  ESCAPE[sprintf("%c", 127)] = "\\u007f"
  ESCAPE["\t"] = "\\t"
  ESCAPE["\n"] = "\\n"
  ESCAPE["\r"] = ""
  ESCAPE["\\"] = "\\\\"
  ESCAPE["\""] = "\\\""
}

function text(k,   s) {
  s = $0
  while (k-- > 0) s = substr(s, index(s, T) + 1)
  return s
}

# A byte loop rather than gsub, whose replacement strings treat "\" and "&"
# differently from one awk to the next.
function json(s,   out, n, k, c) {
  out = ""
  n = length(s)
  for (k = 1; k <= n; k++) {
    c = substr(s, k, 1)
    out = out ((c in ESCAPE) ? ESCAPE[c] : c)
  }
  return out
}

function head(line) {
  HEAD[++nhead] = line
}

function put(line) {
  BODY[++nbody] = line
  used += length(line) + 1
}

function gap() {
  return nbody ? 1 : 0
}

function open_section() {
  if (nbody) put("")
}

function fits(bytes) {
  return used + bytes + RESERVE <= BUDGET
}

function warnings(   k, bytes) {
  if (!nwarnings) return
  open_section()
  put(ENVIRON["CONSTITUTION_STARTUP"] != "" ? "⚠️ Warnings — tell the user at the start of the session" : "⚠️ Warnings")
  bytes = 0
  for (k = 1; k <= nwarnings && bytes + length(WARNING[k]) + 1 <= WARNING_BUDGET; k++) {
    put(WARNING[k])
    bytes += length(WARNING[k]) + 1
  }
  if (k <= nwarnings) put("and " (nwarnings - k + 1) " more")
}

function core(   path, line, r, lines) {
  path = ENVIRON["CONSTITUTION_CORE"]
  lines = 0
  while ((r = (getline line < path)) > 0) {
    if (line ~ /^Laws of [a-z]+: / && !(substr(line, 9, index(line, ":") - 9) in FOLLOWED)) continue
    if (!lines++) open_section()
    put(line)
  }
  if (r < 0) exit 2
  close(path)
  if (corefiles == "") return
  if (!lines) open_section()
  put(corefiles)
}

function index_lines(   k) {
  for (k = 1; k <= nindex; k++) {
    if (!fits((k == 1 ? gap() : 0) + length(INDEX[k]) + 1)) break
    if (k == 1) open_section()
    put(INDEX[k])
  }
  if (k > nindex) return
  if (k == 1) open_section()
  put((nindex - k + 1) (nindex - k + 1 == 1 ? " more line" : " more lines") " of the block list did not fit; constitution.yaml names every block.")
  cut = 1
}

# Headlines go in by whole blocks, in index order, until one does not fit.
function headlines(   k, g, end, cost, first, left) {
  first = 1
  left = 0
  for (k = 1; k <= nheadlines; k = end + 1) {
    for (end = k; end < nheadlines && HBLOCK[end + 1] == HBLOCK[k]; end++) ;
    if (!cut) {
      cost = first ? gap() + length("## MUST headlines") + 1 : 0
      for (g = k; g <= end; g++) cost += length(HEADLINE[g]) + 1
      if (fits(cost)) {
        if (first) {
          open_section()
          put("## MUST headlines")
          first = 0
        }
        for (g = k; g <= end; g++) put(HEADLINE[g])
        continue
      }
      cut = 1
    }
    left++
  }
  if (!left) return
  if (first) open_section()
  put("The MUST headlines of " left (left == 1 ? " block were" : " blocks were") " left out; the block files hold them.")
}

function print_json(   k) {
  printf "{\"hookSpecificOutput\":{\"hookEventName\":\"%s\",\"additionalContext\":\"", json(ENVIRON["CONSTITUTION_EVENT"])
  for (k = 1; k <= nhead; k++) printf "%s\\n", json(HEAD[k])
  if (nbody) printf "\\n"
  for (k = 1; k <= nbody; k++) printf "%s\\n", json(BODY[k])
  printf "\"}}\n"
}

$1 == "error" { failed = $2 }
$1 == "core" { corefiles = text(1) }
$1 == "axis" { FOLLOWED[$2] = 1 }
$1 == "pin" { pin = text(1) }
$1 == "count" { count = $2 }
$1 == "warning" { WARNING[++nwarnings] = text(1) }
$1 == "index" { INDEX[++nindex] = text(1) }
$1 == "headline" {
  HBLOCK[++nheadlines] = $2
  HEADLINE[nheadlines] = text(2)
}

END {
  installed = ENVIRON["CONSTITUTION_INSTALLED"]
  head("The droneey constitution plugin " installed " supplies this repository's rules. Block files live under " ENVIRON["CONSTITUTION_ROOT"] ".")
  if (failed != "") {
    head("constitution.yaml does not parse at line " failed "; only core applies.")
    core()
  } else {
    head("constitution.yaml pins " (pin == "" ? "no version" : pin) "; " count (count == 1 ? " block is" : " blocks are") " active.")
    if (ENVIRON["CONSTITUTION_STARTUP"] != "" && pin != "" && pin != installed) head("constitution.yaml pins " pin " while the installed plugin is " installed "; this digest follows " installed ".")
    warnings()
    core()
    index_lines()
    headlines()
  }
  print_json()
}
