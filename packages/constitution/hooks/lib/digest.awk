# The budgets count bytes: under the hook's LC_ALL=C, length() and substr() work
# on bytes in every awk.

BEGIN {
  FS = "\t"
  T = "\t"
  BUDGET = 9400
  WARNING_BUDGET = 1000
  LEFT_OUT_LINE_BUDGET = 200
}

function text(k,   s) {
  s = $0
  while (k-- > 0) s = substr(s, index(s, T) + 1)
  return s
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
  return used + bytes + LEFT_OUT_LINE_BUDGET <= BUDGET
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

# Core's passport without its front matter and the blank lines around its text.
function core(   path, line, r, lines, read, front, started, blanks) {
  path = ENVIRON["CONSTITUTION_CORE"]
  lines = 0
  read = 0
  front = 0
  started = 0
  blanks = 0
  while ((r = (getline line < path)) > 0) {
    sub(/\r$/, "", line)
    if (!read++ && line == "---") {
      front = 1
      continue
    }
    if (front) {
      if (line == "---") front = 0
      continue
    }
    if (line == "") {
      if (started) blanks++
      continue
    }
    if (!lines++) open_section()
    for (; blanks > 0; blanks--) put("")
    started = 1
    put(line)
  }
  if (r < 0) exit 2
  close(path)
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
}

function print_json(   k) {
  printf "{\"hookSpecificOutput\":{\"hookEventName\":\"%s\",\"additionalContext\":\"", json(ENVIRON["CONSTITUTION_EVENT"])
  for (k = 1; k <= nhead; k++) printf "%s\\n", json(HEAD[k])
  if (nbody) printf "\\n"
  for (k = 1; k <= nbody; k++) printf "%s\\n", json(BODY[k])
  printf "\"}}\n"
}

# A Constitution this plugin cannot read, or its absence, leaves only the reason.
function notice(kind, found,   archive) {
  archive = ENVIRON["CONSTITUTION_ROOT"]
  if (kind == "missing") {
    head("The Droneey Constitution is not installed in this repository: " archive " does not exist, so no rules are given.")
    head("Tell the user to run mise install, which installs the release mise.toml pins as github:droneey/constitution and links it there.")
  } else if (kind == "older") {
    head("The Droneey Constitution in " archive " is older than block format " ENVIRON["CONSTITUTION_OLDEST"] ", the oldest this plugin reads, so no rules are given.")
    head("Tell the user to raise the Constitution pin in this project's mise.toml and run mise install.")
  } else {
    head("The Droneey Constitution in " archive " has block format " found ", newer than this plugin reads, so no rules are given.")
    head("Tell the user to update the Constitution plugin: claude plugin marketplace update droneey, then claude plugin update constitution@droneey.")
  }
}

$1 == "notice" { notice_kind = $2; notice_found = $3 }
$1 == "error" { failed = $2 }
$1 == "count" { count = $2 }
$1 == "warning" { WARNING[++nwarnings] = text(1) }
$1 == "index" { INDEX[++nindex] = text(1) }

END {
  if (notice_kind != "") {
    notice(notice_kind, notice_found)
    print_json()
    exit
  }
  installed = ENVIRON["CONSTITUTION_INSTALLED"]
  head("The Droneey Constitution " installed " supplies this repository's rules. Block files live under " ENVIRON["CONSTITUTION_ROOT"] ".")
  if (failed != "") {
    head("constitution.yaml does not parse at line " failed "; only core applies.")
    core()
  } else {
    head("constitution.yaml makes " count (count == 1 ? " block" : " blocks") " active.")
    warnings()
    core()
    index_lines()
  }
  print_json()
}
