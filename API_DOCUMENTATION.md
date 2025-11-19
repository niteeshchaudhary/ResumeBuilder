# Reserish API Documentation

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [User Profile Management](#user-profile-management)
- [Resume Management](#resume-management)
- [Resume Templates](#resume-templates)
- [Job Management](#job-management)
- [Payment and Plans](#payment-and-plans)
- [Additional Features](#additional-features)

## Authentication Endpoints

### Register Account
- **Endpoint**: `POST /api/register/`
- **Description**: Register a new user account
- **Authentication**: Not required
- **Input Example**:
```json
{
    "email": "user@example.com",
    "password": "securepassword",
    "is_enterprise": false
}
```
- **Output Example**:
```json
{
    "message": "Registration successful. Please verify your email."
}
```

### Login (User)
- **Endpoint**: `POST /api/u/login/`
- **Description**: Login for regular users
- **Authentication**: Not required
- **Input Example**:
```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```
- **Output Example**:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Login (Enterprise)
- **Endpoint**: `POST /api/e/login/`
- **Description**: Login for enterprise users
- **Authentication**: Not required
- **Input Example**:
```json
{
    "email": "enterprise@example.com",
    "password": "securepassword"
}
```
- **Output Example**:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Google Login
- **Endpoint**: `POST /api/u/google-login/`
- **Description**: Login using Google authentication
- **Authentication**: Not required
- **Input Example**:
```json
{
    "token": "google_oauth_token"
}
```
- **Output Example**:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Password Reset Request
- **Endpoint**: `POST /api/reset-password/`
- **Description**: Request a password reset link
- **Authentication**: Not required
- **Input Example**:
```json
{
    "email": "user@example.com"
}
```
- **Output Example**:
```json
{
    "message": "Password reset link has been sent to your email"
}
```

### Password Reset Confirm
- **Endpoint**: `POST /api/reset-password-confirm/<uidb64>/<token>/`
- **Description**: Reset password using the token from email
- **Authentication**: Not required
- **Input Example**:
```json
{
    "password": "newpassword"
}
```
- **Output Example**:
```json
{
    "message": "Password reset successful"
}
```

## User Profile Management

### Complete Profile
- **Endpoint**: `GET/PUT /api/complete-profile/`
- **Description**: Get or update user profile information
- **Authentication**: Required (JWT Token)
- **Input Example (PUT)**:
```json
{
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St"
}
```
- **Output Example (GET)**:
```json
{
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "is_enterprise": false
}
```

### Upload Profile Picture
- **Endpoint**: `POST /api/upload-profile-pic/`
- **Description**: Upload or update user profile picture
- **Authentication**: Required (JWT Token)
- **Input**: Form data with file
- **Output Example**:
```json
{
    "message": "Profile picture uploaded successfully",
    "url": "http://example.com/media/profiles/user_id/filename.jpg"
}
```

## Resume Management

### Get User Data
- **Endpoint**: `POST /api/userdata/<section_name>/`
- **Description**: Get user data for specific section (personal, experience, education, project, skill, certification, publication, achievement, all)
- **Authentication**: Required (JWT Token)
- **Input Example**:
```json
{
    "section_name": "education"
}
```
- **Output Example**:
```json
[
    {
        "id": 1,
        "institution": "University of Example",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "from_date": "2018-09",
        "to_date": "2022-06",
        "currentlyStuding": false,
        "score": "3.8",
        "scoreType": "GPA"
    }
]
```

### Set User Data
- **Endpoint**: `POST /api/setuserdata/<section_name>/`
- **Description**: Create or update user data for specific section
- **Authentication**: Required (JWT Token)
- **Input Example** (for education):
```json
{
    "institution": "University of Example",
    "degree": "Bachelor of Science",
    "fieldOfStudy": "Computer Science",
    "from_date": "2018-09",
    "to_date": "2022-06",
    "currentlyStuding": false,
    "score": "3.8",
    "scoreType": "GPA"
}
```
- **Output Example**:
```json
{
    "info": "Education saved.",
    "id": 1
}
```

### Delete User Data
- **Endpoint**: `POST /api/deluserdata/<section_name>/`
- **Description**: Delete user data for specific section
- **Authentication**: Required (JWT Token)
- **Input Example**:
```json
{
    "id": 1
}
```
- **Output Example**:
```json
{
    "info": "Education deleted."
}
```

## Resume Templates

### Get Templates
- **Endpoint**: `GET /api/templates/`
- **Description**: Get list of available resume templates
- **Authentication**: Required (JWT Token)
- **Output Example**:
```json
[
    {
        "id": 1,
        "title": "Modern",
        "description": "Resume template",
        "category": "Resume",
        "image": "http://example.com/media/latex_templates/images/Modern.png"
    }
]
```

### Get Template Content
- **Endpoint**: `GET /api/templates/<template_name>/`
- **Description**: Get content of specific template
- **Authentication**: Required (JWT Token)
- **Output Example**:
```json
{
    "content": "LaTeX template content..."
}
```

## Job Management

### Post Job
- **Endpoint**: `POST /api/post-job/`
- **Description**: Create a new job posting
- **Authentication**: Required (JWT Token)
- **Input Example**:
```json
{
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "description": "Job description...",
    "requirements": ["Python", "Django", "React"],
    "salary_range": "80k-120k"
}
```
- **Output Example**:
```json
{
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "status": "active"
}
```

### List Jobs
- **Endpoint**: `GET /api/joblisting/`
- **Description**: Get list of available jobs
- **Authentication**: Required (JWT Token)
- **Output Example**:
```json
{
    "jobs": [
        {
            "id": 1,
            "title": "Software Engineer",
            "company": "Tech Corp",
            "location": "Remote",
            "posted_date": "2024-03-20"
        }
    ]
}
```

### Apply for Job
- **Endpoint**: `POST /api/apply/`
- **Description**: Apply for a job posting
- **Authentication**: Required (JWT Token)
- **Input Example**:
```json
{
    "job_id": 1,
    "resume_id": 1,
    "cover_letter": "I am interested in this position..."
}
```
- **Output Example**:
```json
{
    "message": "Application submitted successfully",
    "application_id": 1
}
```

## Payment and Plans

### Get Plans
- **Endpoint**: `POST /api/get_plans/`
- **Description**: Get available subscription plans
- **Authentication**: Required (JWT Token)
- **Input Example**:
```json
{
    "usertype": "u"  // or "e" for enterprise
}
```
- **Output Example**:
```json
{
    "plans": [
        {
            "id": 1,
            "name": "Basic",
            "price": 9.99,
            "features": ["Feature 1", "Feature 2"]
        }
    ],
    "active_plan": 1
}
```

### Initiate Payment
- **Endpoint**: `POST /api/initiate_payment/`
- **Description**: Start payment process for a plan
- **Authentication**: Required (JWT Token)
- **Input Example**:
```json
{
    "plan_id": 1,
    "payment_method": "razorpay"
}
```
- **Output Example**:
```json
{
    "order_id": "order_123",
    "amount": 999,
    "currency": "INR"
}
```

### Download Statement
- **Endpoint**: `GET /api/downloadstatement/`
- **Description**: Download transaction history
- **Authentication**: Required (JWT Token)
- **Query Parameters**: `format=csv` or `format=pdf`
- **Output**: CSV or PDF file with transaction history

## Additional Features

### Contact Us
- **Endpoint**: `POST /api/contact-us/`
- **Description**: Send contact form message
- **Authentication**: Not required
- **Input Example**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I have a question about..."
}
```
- **Output Example**:
```json
{
    "message": "Message sent successfully"
}
```

### Resume Parser
- **Endpoint**: `POST /api/resume-parser/`
- **Description**: Parse resume content from uploaded file
- **Authentication**: Required (JWT Token)
- **Input**: Form data with file
- **Output Example**:
```json
{
    "parsed_data": {
        "name": "John Doe",
        "email": "john@example.com",
        "education": [...],
        "experience": [...],
        "skills": [...]
    }
}
```

### Bulk Resume Upload
- **Endpoint**: `POST /api/bulk-resume-upload/`
- **Description**: Upload multiple resumes for parsing
- **Authentication**: Required (JWT Token)
- **Input**: Form data with multiple files
- **Output Example**:
```json
{
    "task_id": "task_123",
    "message": "Upload started"
}
```

## Authentication

For endpoints that require authentication, include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The user doesn't have permission
- `404 Not Found`: The resource was not found
- `500 Internal Server Error`: An error occurred on the server

Error responses will include a JSON object with an error message:
```json
{
    "error": "Error message description"
}
``` 