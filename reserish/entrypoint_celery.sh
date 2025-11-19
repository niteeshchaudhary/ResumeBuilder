#!/bin/sh

echo "🚀 Starting Celery setup..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
while ! nc -z redis 6379 2>/dev/null; do
  echo "Redis not ready, waiting..."
  sleep 2
done
echo "✅ Redis is ready!"

# Note: Migrations are handled by the main Django app
echo "ℹ️  Skipping migrations (handled by main app)"

# Start Celery worker
echo "🎯 Starting Celery worker..."
exec celery -A reserish worker --loglevel=info --concurrency=2
