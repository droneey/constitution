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

function core(   path, line, r, lines, k) {
  path = ENVIRON["CONSTITUTION_CORE"]
  lines = 0
  while ((r = (getline line < path)) > 0) {
    if (!lines++) open_section()
    put(line)
  }
  if (r < 0) exit 2
  close(path)
  if (!ncorefiles) return
  if (!lines) open_section()
  for (k = 1; k <= ncorefiles; k++) put(COREFILES[k])
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

# The digests this plugin cannot read, or their absence, leave only the reason.
function notice(kind, found,   archive) {
  archive = ENVIRON["CONSTITUTION_ROOT"]
  if (kind == "missing") {
    head("The droneey constitution is not installed in this repository: " archive " does not exist, so no rules are given.")
    head("Tell the user to run mise install, which installs the release mise.toml pins as github:droneey/constitution and links it there.")
  } else if (kind == "ungenerated") {
    head("The droneey constitution in " archive " has blocks but no generated digests, so no rules are given.")
    head("Tell the user to run bun run digests:write in that working tree.")
  } else if (kind == "older") {
    head("The droneey constitution in " archive " is older than digest format " ENVIRON["CONSTITUTION_OLDEST"] ", the oldest this plugin reads, so no rules are given.")
    head("Tell the user to raise the constitution pin in this project, in mise.toml and constitution.yaml, and run mise install.")
  } else {
    head("The droneey constitution in " archive " has digest format " found ", newer than this plugin reads, so no rules are given.")
    head("Tell the user to update the constitution plugin: claude plugin marketplace update droneey, then claude plugin update constitution@droneey.")
  }
}

$1 == "notice" { notice_kind = $2; notice_found = $3 }
$1 == "error" { failed = $2 }
$1 == "core" { COREFILES[++ncorefiles] = text(1) }
$1 == "pin" { pin = text(1) }
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
  head("The droneey constitution " installed " supplies this repository's rules. Block files live under " ENVIRON["CONSTITUTION_ROOT"] ".")
  if (failed != "") {
    head("constitution.yaml does not parse at line " failed "; only core applies.")
    core()
  } else {
    head("constitution.yaml pins " (pin == "" ? "no version" : pin) "; " count (count == 1 ? " block is" : " blocks are") " active.")
    if (ENVIRON["CONSTITUTION_STARTUP"] != "" && pin != "" && pin != installed) head("constitution.yaml pins " pin " while .droneey/constitution holds " installed "; this digest follows " installed ".")
    warnings()
    core()
    index_lines()
  }
  print_json()
}
