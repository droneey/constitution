#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 [dev] [up|down]"
  echo ""
  echo "  dev  - Development environment."
  echo ""
  echo "  up   - Start containers."
  echo "  down - Stop and remove containers."
  exit 1
fi

ENVIRONMENT="$1"
ACTION="$2"

APP_NAME_SLUG=$(grep -m1 '^APP_NAME_SLUG=' .env 2>/dev/null | cut -d= -f2)

case "$ENVIRONMENT" in
  dev)
    PROFILE="development"
    NODE_MODULES_VOLUME="${APP_NAME_SLUG}_node-modules"
    ;;
  *)
    echo "Error: Invalid environment '$ENVIRONMENT'"
    echo "Usage: $0 [dev] [up|down]"
    exit 1
    ;;
esac

compose() {
  docker compose --env-file .env --profile "$PROFILE" "$@"
}

compute_local_hash() {
  {
    sha256sum bun.lock
    if [ -d patches ]; then
      find patches -type f -print0 | sort -z | xargs -0 sha256sum 2>/dev/null
    fi
  } | sha256sum | cut -d' ' -f1
}

read_volume_hash() {
  docker run --rm -v "$NODE_MODULES_VOLUME":/vol alpine \
    cat /vol/.bun-lock-hash 2>/dev/null || echo ""
}

remove_node_modules_volume() {
  # Force-stop containers using the volume so removal can succeed.
  compose down --remove-orphans 2>/dev/null || true

  # Remove the volume. If a container outside this compose project holds it,
  # surface the error instead of swallowing it silently.
  if docker volume inspect "$NODE_MODULES_VOLUME" >/dev/null 2>&1; then
    if ! docker volume rm "$NODE_MODULES_VOLUME"; then
      echo ""
      echo "ERROR: Failed to remove volume '$NODE_MODULES_VOLUME'."
      echo "       A container outside this compose project may still be using it."
      echo "       Run: docker ps -a --filter \"volume=$NODE_MODULES_VOLUME\""
      exit 1
    fi
  fi
}

case "$ACTION" in
  up)
    LOCAL_HASH=$(compute_local_hash)
    VOLUME_HASH=$(read_volume_hash)

    if [ -n "$VOLUME_HASH" ] && [ "$LOCAL_HASH" = "$VOLUME_HASH" ]; then
      echo "bun.lock unchanged, reusing node_modules volume."
    else
      if [ -z "$VOLUME_HASH" ]; then
        echo "node_modules volume has no hash marker (first run or stale)."
      else
        echo "bun.lock changed:"
        echo "  local : $LOCAL_HASH"
        echo "  volume: $VOLUME_HASH"
      fi
      echo "Recreating node_modules volume..."
      remove_node_modules_volume
    fi

    cleanup() {
      echo ""
      echo "Stopping $ENVIRONMENT containers..."
      compose down
    }
    trap cleanup EXIT

    echo "Starting $ENVIRONMENT containers..."
    compose up --remove-orphans --build
    ;;
  down)
    echo "Stopping $ENVIRONMENT containers..."
    compose down
    ;;
  *)
    echo "Error: Invalid action '$ACTION'"
    echo "Usage: $0 [dev] [up|down]"
    exit 1
    ;;
esac
