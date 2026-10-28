#!/bin/sh
# shellcheck disable=SC3043 # busybox's ash, the image's shell, has local
set -eu
# shellcheck disable=SC3040 # busybox's ash, the image's shell, has it
set -o pipefail

readonly ARCHIVE='constitution-docs.tar.gz'
readonly REPOSITORY="${GITHUB_REPOSITORY:-droneey/constitution}"
readonly API_URL="${GITHUB_API_URL:-https://api.github.com}"
readonly SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
readonly TOKEN_FILE="${GITHUB_TOKEN_FILE:-/run/secrets/github_token}"
readonly KEPT="${KEPT_RELEASES:-10}"

log() {
  printf '%s\n' "$*" >&2
}

# Why: api checks its own commands, as set -e is off where a caller runs api as a condition.
api() {
  set -- --header 'Accept: application/vnd.github+json' -- "$API_URL/repos/$REPOSITORY/$1"
  if [ -r "$TOKEN_FILE" ]; then
    token="$(cat -- "$TOKEN_FILE")" || return
    set -- --header "Authorization: Bearer $token" "$@"
  fi
  wget -q -O - "$@"
}

releases_kept() {
  if [ "$KEPT" -eq 0 ]; then
    return
  fi
  api 'releases?per_page=100' | jq -r --arg archive "$ARCHIVE" --argjson kept "$KEPT" '
    [.[]
      | select((.draft | not) and (.tag_name | test("^v[0-9]+[.][0-9]+[.][0-9]+$")))
      | select([.assets[].name] | index($archive) and index($archive + ".sha256"))
      | {version: .tag_name[1:], prerelease}]
    | sort_by(.version | split(".") | map(tonumber)) | reverse | .[:$kept][]
    | "\(.version) \(.prerelease)"'
}

latest_release() {
  if [ "$KEPT" -eq 0 ]; then
    return
  fi
  # shellcheck disable=SC2310 # api checks its commands itself
  if ! api 'releases/latest' | jq -r '.tag_name | ltrimstr("v")'; then
    log 'No latest release could be read: the current build is the latest.'
  fi
}

unpack_release() {
  local release_version="$1"
  local site_folder="$2"
  downloads="$(mktemp -d)"
  trap 'rm -rf "$downloads"' EXIT
  trap 'rm -rf "$downloads"; exit 1' HUP INT TERM

  for file in "$ARCHIVE" "$ARCHIVE.sha256"; do
    wget -q -O "$downloads/$file" -- "$SERVER_URL/$REPOSITORY/releases/download/v$release_version/$file"
  done
  if ! (cd "$downloads" && sha256sum -c -s -- "$ARCHIVE.sha256"); then
    log "The archive of v$release_version does not match its checksum."
    exit 1
  fi
  mkdir -p "$site_folder/v$release_version"
  tar -xzf "$downloads/$ARCHIVE" -C "$site_folder/v$release_version"
  rm -rf "$downloads"
  trap - EXIT HUP INT TERM
}

versions_list() {
  local served_lines="$1"
  local latest_version="$2"
  printf '%s\n' "$served_lines" | jq -R -s --arg latest "$latest_version" '
    [split("\n")[] | select(. != "") | split(" ") | {version: .[0], prerelease: (.[1] == "true")}]
    | {
        latest: $latest,
        versions: (
          [.[] | select((.prerelease | not) or .version == $latest) | .version]
          | unique_by(split(".") | map(tonumber)) | reverse
        )
      }'
}

# Why: the server has no 404 page per folder, and its rewrites replace files that exist too, so its
# one page for an address with no file loads the app shell of the release the address names, or the
# latest's, under the same address, where that release's router shows its own not-found page.
not_found_page() {
  local latest_version="$1"
  cat <<EOF
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found</title>
<script>
(async () => {
  const latest = '/v$latest_version/';
  const named = /^\/v[0-9]+[.][0-9]+[.][0-9]+\//.exec(location.pathname)?.[0] ?? latest;
  let shell = await fetch(named + '_shell.html');
  if (!shell.ok) shell = await fetch(latest + '_shell.html');
  const html = await shell.text();
  document.open();
  document.write(html);
  document.close();
})();
</script>
</head>
<body></body>
</html>
EOF
}

server_config() {
  local latest_version="$1"
  printf '%s\n' '[advanced]'
  for address in '/' '/docs' '/llms.txt' '/llms-full.txt'; do
    printf '\n[[advanced.redirects]]\nsource = "%s"\ndestination = "/v%s%s"\nkind = 302\n' \
      "$address" "$latest_version" "$address"
  done
  # shellcheck disable=SC2016 # the $1 in the text is the server's capture, not the shell's
  printf '\n[[advanced.redirects]]\nsource = "/docs/{**}"\ndestination = "/v%s/docs/$1"\nkind = 302\n' \
    "$latest_version"
}

main() {
  if [ "$#" -ne 4 ]; then
    log 'Usage: scripts/fetch-releases.sh <current build> <current version> <site> <server config>'
    exit 1
  fi
  current_build="$1"
  current="$2"
  site="$3"
  config="$4"

  kept="$(releases_kept)"
  github_latest="$(latest_release)"
  mkdir -p "$site"

  printf '%s\n' "$kept" | while IFS= read -r release; do
    if [ -n "$release" ]; then
      log "Unpacking v${release%% *}."
      unpack_release "${release%% *}" "$site"
    fi
  done
  served="$kept"
  if ! printf '%s\n' "$kept" | cut -d ' ' -f 1 | grep -F -x -q -- "$current"; then
    log "No release carries v$current: the current build is served under it."
    cp -R -- "$current_build" "$site/v$current"
    served="$(printf '%s\n%s false' "$kept" "$current")"
  fi

  latest="$current"
  if [ -n "$github_latest" ] && [ -d "$site/v$github_latest" ]; then
    latest="$github_latest"
  fi
  log "Latest: v$latest."

  versions_list "$served" "$latest" >"$site/versions.json"
  not_found_page "$latest" >"$site/404.html"
  server_config "$latest" >"$config"
}

main "$@"
