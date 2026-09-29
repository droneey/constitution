#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 [unit|e2e]"
  echo ""
  echo "  unit - Run unit tests in Docker."
  echo "  e2e  - Run e2e tests in Docker."
  exit 1
fi

ACTION="$1"

case "$ACTION" in
  unit)
    PROFILE="test-unit"
    SERVICE="backend-test-unit"
    ;;
  e2e)
    PROFILE="test-e2e"
    SERVICE="backend-test-e2e"
    ;;
  *)
    echo "Error: Invalid action '$ACTION'"
    echo "Usage: $0 [unit|e2e]"
    exit 1
    ;;
esac

cleanup() {
  docker compose --profile "$PROFILE" down -v --remove-orphans 2>/dev/null || true
}

# A previous run may have stopped before its teardown.
cleanup

trap cleanup EXIT

echo "Running $ACTION tests in Docker..."
docker compose --env-file .env --profile "$PROFILE" up \
  --build \
  --force-recreate \
  --renew-anon-volumes \
  --abort-on-container-exit \
  "$SERVICE"
