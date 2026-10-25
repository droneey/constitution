#!/bin/sh
# Lays out the site the production image serves: each kept release's site, the current build where
# no release carries its version, the version menu's list, the not-found page and the redirects:
#   scripts/fetch-releases.sh <current build> <current version> <site> <server config>
# KEPT_RELEASES: how many releases to keep, newest first by version; 0 serves the current build alone
# GITHUB_REPOSITORY, GITHUB_API_URL, GITHUB_SERVER_URL: where the releases are, as in GitHub Actions
# GITHUB_TOKEN_FILE: a token that lifts the API's limit of 60 requests an hour, read if it exists
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

# the API's answer to the path; it checks its own commands, as set -e is off where a caller runs
# it as a condition
api() {
  set -- --header 'Accept: application/vnd.github+json' -- "$API_URL/repos/$REPOSITORY/$1"
  if [ -r "$TOKEN_FILE" ]; then
    token="$(cat -- "$TOKEN_FILE")" || return
    set -- --header "Authorization: Bearer $token" "$@"
  fi
  wget -q -O - "$@"
}

# the releases carrying the archive and its checksum, newest first by version, as
# `<version> <pre-release>`
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

# the version of the release GitHub calls the latest, or nothing when none is, or none can be read
latest_release() {
  if [ "$KEPT" -eq 0 ]; then
    return
  fi
  # shellcheck disable=SC2310 # api checks its commands itself
  if ! api 'releases/latest' | jq -r '.tag_name | ltrimstr("v")'; then
    log 'No latest release could be read: the current build is the latest.'
  fi
}

# unpacks the archive of release $1 into its folder of site $2, once its checksum holds
unpack_release() {
  downloads="$(mktemp -d)"
  trap 'rm -rf "$downloads"' EXIT
  trap 'rm -rf "$downloads"; exit 1' HUP INT TERM

  for file in "$ARCHIVE" "$ARCHIVE.sha256"; do
    wget -q -O "$downloads/$file" -- "$SERVER_URL/$REPOSITORY/releases/download/v$1/$file"
  done
  if ! (cd "$downloads" && sha256sum -c -s -- "$ARCHIVE.sha256"); then
    log "The archive of v$1 does not match its checksum."
    exit 1
  fi
  mkdir -p "$2/v$1"
  tar -xzf "$downloads/$ARCHIVE" -C "$2/v$1"
  rm -rf "$downloads"
  trap - EXIT HUP INT TERM
}

# `{latest, versions}` of the sites served, `<version> <pre-release>` lines in $1, and the latest, $2:
# every one but the pre-releases, which stay reachable unlisted, and the latest
versions_list() {
  printf '%s\n' "$1" | jq -R -s --arg latest "$2" '
    [split("\n")[] | select(. != "") | split(" ") | {version: .[0], prerelease: (.[1] == "true")}]
    | {
        latest: $latest,
        versions: (
          [.[] | select((.prerelease | not) or .version == $latest) | .version]
          | unique_by(split(".") | map(tonumber)) | reverse
        )
      }'
}

# the server's one page for an address with no file, $1 the latest: it loads the app shell of the
# release the address names, or the latest's for an address outside every release, under the same
# address, so that release's router shows its own not-found page; the server has no 404 page per
# folder, and its rewrites replace files that exist too
not_found_page() {
  cat <<EOF
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found</title>
<script>
(async () => {
  const latest = '/v$1/';
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

# static-web-server's redirects of every address with no release to the latest's, $1
server_config() {
  printf '%s\n' '[advanced]'
  for address in '/' '/docs' '/llms.txt' '/llms-full.txt'; do
    printf '\n[[advanced.redirects]]\nsource = "%s"\ndestination = "/v%s%s"\nkind = 302\n' \
      "$address" "$1" "$address"
  done
  # shellcheck disable=SC2016 # the $1 in the text is the server's capture, not the shell's
  printf '\n[[advanced.redirects]]\nsource = "/docs/{**}"\ndestination = "/v%s/docs/$1"\nkind = 302\n' \
    "$1"
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
