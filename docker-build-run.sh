#!/bin/sh
set -eu

cd "$(dirname "$0")"

docker build -f Dockerfile -t metric-render-backend:single-stage .
docker build -f Dockerfile.multistage -t metric-render-backend:multi-stage .

echo
docker image ls metric-render-backend
echo

variant="${1:-multi-stage}"
case "$variant" in
  single-stage)
    dockerfile=Dockerfile
    image_tag=single-stage
    ;;
  multi-stage)
    dockerfile=Dockerfile.multistage
    image_tag=multi-stage
    ;;
  *)
    echo "Usage: $0 [single-stage|multi-stage]" >&2
    exit 2
    ;;
esac

if [ ! -f .env ]; then
  echo "Missing .env. Create it from .env.example before starting the services." >&2
  exit 1
fi

APP_DOCKERFILE="$dockerfile" APP_IMAGE_TAG="$image_tag" docker compose up --no-build
