#!/bin/bash

# Build optimized Docker images with size reduction techniques

echo "🚀 Building optimized Docker images..."

# Enable Docker BuildKit for better caching and optimization
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Clean up old images and containers
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build with BuildKit and optimizations
echo "🔨 Building Celery images with optimizations..."

# Build Celery worker
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from reserish_main_celery:latest \
  --target builder \
  -f Dockerfile.celery.lightweight \
  -t reserish_main_celery:latest \
  .

# Build Celery beat
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from reserish_main_celery-beat:latest \
  --target builder \
  -f Dockerfile.celery.lightweight \
  -t reserish_main_celery-beat:latest \
  .

# Build Django app
echo "🔨 Building Django app..."
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from reserish_main_djwebapp:latest \
  -f Dockerfile.backend \
  -t reserish_main_djwebapp:latest \
  .

# Show image sizes
echo "📊 Final image sizes:"
docker images | grep reserish_main

# Optional: Push to registry if needed
# echo "📤 Pushing images to registry..."
# docker push reserish_main_celery:latest
# docker push reserish_main_celery-beat:latest
# docker push reserish_main_djwebapp:latest

echo "✅ Build complete!"

