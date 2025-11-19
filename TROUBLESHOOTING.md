# 🚨 Troubleshooting Guide - Interview Scheduling System

## Common Issues and Solutions

### 1. **"process is not defined" Error**

**Error Message:**
```
InterviewBookingModal.jsx:20 Uncaught ReferenceError: process is not defined
```

**Cause:** This error occurs because `process.env` is not available in the browser environment. The project uses Vite, which requires `import.meta.env` instead.

**Solution:**
1. **Set Environment Variable:**
   ```bash
   export VITE_API_URL=http://localhost:8000/reserish
   ```

2. **Create .env file in frontend directory:**
   ```bash
   cd frontend
   cp env.example .env
   # Edit .env and set VITE_API_URL=http://localhost:8000/reserish
   ```

3. **Restart your frontend development server**

**Note:** In Vite, environment variables must be prefixed with `VITE_` to be available in the browser.

### 2. **API Connection Errors**

**Error Message:**
```
Failed to load interview slots
Failed to fetch slots
```

**Causes:**
- Backend server not running
- Incorrect API URL
- CORS issues
- Network connectivity problems

**Solutions:**
1. **Check Backend Server:**
   ```bash
   cd reserish
   python manage.py runserver
   ```

2. **Verify API URL:**
   - Check `VITE_API_URL` environment variable
   - Ensure it matches your backend server address

3. **Test API Endpoints:**
   ```bash
   python test_interview_api.py
   ```

4. **Check CORS Configuration:**
   - Ensure Django CORS settings allow your frontend domain

### 3. **No Interview Slots Available**

**Issue:** Calendar shows no available slots

**Solutions:**
1. **Seed Sample Data:**
   ```bash
   cd reserish
   python manage.py seed_interview_slots
   ```

2. **Check Slot Creation:**
   - Verify slots are created for future dates
   - Check if slots are marked as active

3. **Database Issues:**
   - Run migrations: `python manage.py migrate`
   - Check database connection

### 4. **Authentication Errors**

**Error Message:**
```
401 Unauthorized
Authentication required
```

**Causes:**
- User not logged in
- Invalid/expired token
- Missing authentication headers

**Solutions:**
1. **Ensure User is Logged In:**
   - Check authentication state in frontend
   - Verify JWT token is valid

2. **Check Token Storage:**
   - Verify token is stored in localStorage/sessionStorage
   - Check token expiration

3. **Refresh Authentication:**
   - Log out and log back in
   - Clear browser storage and re-authenticate

### 5. **Booking Failures**

**Error Message:**
```
Booking failed
Slot not available
```

**Causes:**
- Slot already booked by another user
- Slot no longer exists
- Database constraints

**Solutions:**
1. **Check Slot Availability:**
   - Refresh the page to see updated slot status
   - Verify slot exists in database

2. **Database Integrity:**
   - Check for duplicate bookings
   - Verify slot constraints

3. **User Permissions:**
   - Ensure user has permission to book slots
   - Check user account status

### 6. **Frontend Build Issues**

**Error Message:**
```
Module not found
Import error
```

**Solutions:**
1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Clear Cache:**
   ```bash
   npm run build --force
   # or
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node Version:**
   - Ensure Node.js version is compatible
   - Use Node.js 16+ for best compatibility

### 7. **Database Migration Issues**

**Error Message:**
```
Migration failed
Model not found
```

**Solutions:**
1. **Check Model Imports:**
   - Verify models are properly imported in views
   - Check for circular imports

2. **Reset Migrations:**
   ```bash
   cd reserish
   python manage.py migrate backend zero
   python manage.py makemigrations backend
   python manage.py migrate
   ```

3. **Database Reset (Development Only):**
   ```bash
   python manage.py flush
   python manage.py seed_interview_slots
   ```

## 🔧 **Debug Mode**

Enable debug logging in Django settings:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'backend.views': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## 📞 **Getting Help**

1. **Check Logs:**
   - Django server console output
   - Browser developer console
   - Network tab for API calls

2. **Verify Setup:**
   - Run setup script: `./setup_interview_system.sh`
   - Test API endpoints: `python test_interview_api.py`

3. **Common Commands:**
   ```bash
   # Backend
   python manage.py runserver
   python manage.py migrate
   python manage.py seed_interview_slots
   
   # Frontend
   npm run dev
   npm run build
   ```

---

**Remember:** Most issues can be resolved by checking the setup steps and ensuring all services are running correctly.
