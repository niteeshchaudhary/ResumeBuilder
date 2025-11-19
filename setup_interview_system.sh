#!/bin/bash

echo "🎯 Setting up Interview Scheduling System"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "reserish/manage.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected to find reserish/manage.py"
    exit 1
fi

cd reserish

echo "📦 Creating database migrations..."
python manage.py makemigrations backend

if [ $? -eq 0 ]; then
    echo "✅ Migrations created successfully"
else
    echo "❌ Failed to create migrations"
    exit 1
fi

echo "🗄️ Applying migrations to database..."
python manage.py migrate

if [ $? -eq 0 ]; then
    echo "✅ Database migrations applied successfully"
else
    echo "❌ Failed to apply migrations"
    exit 1
fi

echo "🌱 Seeding sample interview slots..."
python manage.py seed_interview_slots

if [ $? -eq 0 ]; then
    echo "✅ Sample slots created successfully"
else
    echo "❌ Failed to create sample slots"
    exit 1
fi

echo ""
echo "🎉 Interview Scheduling System Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start your Django backend server: python manage.py runserver"
echo "2. Test the API endpoints using: python test_interview_api.py"
echo "3. Set environment variable: export VITE_API_URL=http://localhost:8000/reserish"
echo "4. Open the frontend and navigate to InterviewPrep page"
echo "5. Click 'Book Interview Practice' to test the booking flow"
echo ""
echo "📚 For more information, see INTERVIEW_SCHEDULING_README.md"
echo ""
