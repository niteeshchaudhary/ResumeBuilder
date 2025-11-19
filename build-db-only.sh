#!/bin/bash

# Build database-only Celery images for maximum size reduction

echo "🚀 Building database-only Celery images..."

# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Clean up old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Remove old Celery images
echo "🗑️ Removing old Celery images..."
docker rmi reserish_main_celery:latest reserish_main_celery-beat:latest 2>/dev/null || true

# Build database-only Celery worker
echo "🔨 Building database-only Celery worker..."
docker build \
  --no-cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -f Dockerfile.celery.db-only \
  -t reserish_main_celery:latest \
  .

# Build database-only Celery beat
echo "🔨 Building database-only Celery beat..."
docker build \
  --no-cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -f Dockerfile.celery.db-only \
  -t reserish_main_celery-beat:latest \
  .

# Show image sizes
echo "📊 Final image sizes:"
docker images | grep reserish_main

# Calculate size reduction
echo "📈 Size analysis:"
OLD_SIZE=2.69
NEW_SIZE=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep reserish_main_celery | head -1 | awk '{print $3}' | sed 's/GB//')
echo "Old size: ${OLD_SIZE}GB"
echo "New size: ${NEW_SIZE}GB"

if [[ $NEW_SIZE =~ ^[0-9]+\.?[0-9]*$ ]]; then
    REDUCTION=$(echo "scale=2; (${OLD_SIZE} - ${NEW_SIZE}) / ${OLD_SIZE} * 100" | bc -l)
    echo "Size reduction: ${REDUCTION}%"
fi

echo "✅ Database-only build complete!"

