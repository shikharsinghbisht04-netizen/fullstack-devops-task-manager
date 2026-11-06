#!/usr/bin/env bash
set -euo pipefail
cd /opt/fullstack-app

NEW_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
OLD_TAG="$(cat .current_tag 2>/dev/null || echo none)"
export REGISTRY IMAGE_TAG="$NEW_TAG"

docker compose pull
docker compose up -d --remove-orphans

for i in $(seq 1 20); do
  if curl -fs "http://localhost:${WEB_PORT:-80}/api/health" > /dev/null; then
    echo "$NEW_TAG" > .current_tag
    echo "Deployment OK: $NEW_TAG"
    exit 0
  fi
  sleep 3
done

echo "Health check failed - rolling back to $OLD_TAG"
if [ "$OLD_TAG" != "none" ]; then
  export IMAGE_TAG="$OLD_TAG"
  docker compose up -d
fi
exit 1
