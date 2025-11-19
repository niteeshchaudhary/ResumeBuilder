#!/bin/bash

# Build balanced Celery images with comprehensive dependency checking

echo "🚀 Building balanced Celery images..."

# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Test imports first (if Python is available)
if command -v python3 &> /dev/null; then
    echo "🧪 Testing imports before building..."
    if python3 test_celery_imports.py; then
        echo "✅ All imports successful, proceeding with build..."
    else
        echo "❌ Import test failed. Please fix dependencies first."
        exit 1
    fi
else
    echo "⚠️  Python3 not available, skipping import test..."
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Remove old Celery images
echo "🗑️ Removing old Celery images..."
docker rmi reserish_main_celery:latest reserish_main_celery-beat:latest 2>/dev/null || true

# Build balanced Celery worker
echo "🔨 Building balanced Celery worker..."
docker build \
  --no-cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -f Dockerfile.celery.balanced \
  -t reserish_main_celery:latest \
  .

# Build balanced Celery beat
echo "🔨 Building balanced Celery beat..."
docker build \
  --no-cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -f Dockerfile.celery.balanced \
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

echo "✅ Balanced build complete!"

