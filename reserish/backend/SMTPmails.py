from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import HttpResponse

def send_feedback_email(user_email, feedback_link):
    subject = 'Feedback Request'
    html_message = render_to_string('ThankYou.html', {'username': user_email,"feedback_link":feedback_link})

    message = (
        f'Hello,\n\n'
        f'We would appreciate your feedback on our service.\n\n'
        f'Please click the following link to leave your feedback:\n'
        f'{feedback_link}\n\n'
        f'Thank you!'
    )
    sender_email = settings.EMAIL_HOST_USER
    recipient_list = [user_email]

    send_mail(subject, message, sender_email, recipient_list,html_message=html_message)
    
def send_welcome_email(request):
    # Assuming you have a user object
    user = request.user

    # Render the HTML template with the user's data
    html_message = render_to_string('welcome_email.html', {'username': user.username})

    # Optional - You can also create a plain text version of the email
    plain_message = strip_tags(html_message)

    # Send the email
    send_mail(
        'Welcome to Our Site!',
        plain_message,  # Plain text version of the email
        'sender@example.com',  # From email address
        [user.email],  # To email addresses
        html_message=html_message,  # HTML version of the email
    )

    return HttpResponse('Email sent successfully!')
