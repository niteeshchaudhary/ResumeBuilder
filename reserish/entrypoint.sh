
#!/bin/sh

# Wait for DB to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "PostgreSQL started"

exec "$@"

# #!/bin/sh

# # Wait for PostgreSQL to be ready
# echo "Waiting for postgres..."
# while ! nc -z db 5432; do
#   sleep 1
# done
# echo "PostgreSQL started"

# # Apply migrations
# python manage.py migrate

# # Seed initial data
# python manage.py seed_plans

# # Create superuser if it doesn't exist
# echo "from django.contrib.auth import get_user_model; \
# User = get_user_model(); \
# User.objects.filter(email='admin@gmail.com').exists() or \
# User.objects.create_superuser('admin@gmail.com', 'admin')" \
# | python manage.py shell


