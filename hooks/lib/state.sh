export LC_ALL=C
set -o pipefail
unset CDPATH

root="${CLAUDE_PLUGIN_ROOT:-}"
[ -n "${root}" ] || exit 0
lib="${root}/hooks/lib"

field() {
  printf '%s' "${input}" | CONSTITUTION_FIELD="$1" awk -f "${lib}/read-event.awk" 2>/dev/null
}

input="$(tr -d '\r')" || exit 0
session="$(field session_id)" || exit 0
case "${session}" in
  '' | *[!A-Za-z0-9_-]*) exit 0 ;;
esac
state="/tmp/droneey-constitution-$(id -u)/${session}"
[ -f "${state}/active.tsv" ] || exit 0

project="$(awk -F '\t' '$1 == "project" { print $2; exit }' "${state}/active.tsv" 2>/dev/null)"
[ -n "${project}" ] || exit 0

fingerprint() {
  (cd "${project}" && git status --porcelain=v1 --untracked-files=all 2>/dev/null && git diff HEAD 2>/dev/null) | cksum | cut -d ' ' -f 1
}

record() {
  printf '%s\n' "$2" >"${state}/$1" 2>/dev/null
}

recorded() {
  cat "${state}/$1" 2>/dev/null
}
