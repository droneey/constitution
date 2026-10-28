#!/usr/bin/env bash
# Starts or stops the documentation app in Docker, from any folder:
#   scripts/run.sh dev up      the app with live reload, on the working tree
#   scripts/run.sh prod up     the built app, as it is served
#   scripts/run.sh dev down    stops and removes the containers
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='Usage: scripts/run.sh [dev|prod] [up|down]'
readonly DEVELOPMENT_SERVICE='docs-development'
readonly VOLUMES=(
  droneey-constitution-docs-node-modules
  droneey-constitution-docs-node-modules-docs
  droneey-constitution-docs-node-modules-constitution
  droneey-constitution-docs-node-modules-mutation-check
)

log() {
  printf '%s\n' "$*" >&2
}

compose() {
  local profile="$1"
  shift
  docker compose --profile "$profile" "$@"
}

remove_dependency_volumes() {
  local volume
  compose development down --remove-orphans
  for volume in "${VOLUMES[@]}"; do
    if docker volume inspect "$volume" >/dev/null 2>&1; then
      docker volume rm "$volume" >/dev/null
    fi
  done
}

# The volumes keep the dependencies installed in the image they were made from; a changed
# bun.lock makes them stale, so they are made again from the new image.
refresh_dependency_volumes() {
  local lock_hash volume_hash
  lock_hash="$(shasum -a 256 ../../bun.lock | cut -d' ' -f1)"
  # Called directly, not through `compose`: a function on the left of `||` runs with errexit off.
  # A volume with no hash yet makes the command fail, which is the same as a stale one.
  volume_hash="$(docker compose --profile development run --rm --no-deps --entrypoint cat "$DEVELOPMENT_SERVICE" node_modules/.bun-lock-hash 2>/dev/null)" || volume_hash=''

  if [[ "$volume_hash" == "$lock_hash" ]]; then
    log 'bun.lock unchanged: the dependency volumes are kept.'
    return
  fi
  log 'bun.lock changed: the dependency volumes are made again.'
  remove_dependency_volumes
}

main() {
  if (($# != 2)); then
    log "$USAGE"
    exit 1
  fi

  local profile
  case "$1" in
    dev) profile='development' ;;
    prod) profile='production' ;;
    *)
      log "Unknown environment '$1'. $USAGE"
      exit 1
      ;;
  esac

  cd "$(dirname "$0")/.."

  case "$2" in
    up)
      compose "$profile" build
      if [[ "$profile" == 'development' ]]; then
        refresh_dependency_volumes
      fi
      # shellcheck disable=SC2064 # the profile is expanded now, while it is in scope
      trap "compose '$profile' down" EXIT
      compose "$profile" up --remove-orphans
      ;;
    down)
      compose "$profile" down
      ;;
    *)
      log "Unknown action '$2'. $USAGE"
      exit 1
      ;;
  esac
}

main "$@"
