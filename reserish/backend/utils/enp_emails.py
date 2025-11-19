from django.core.mail import send_mail
from django.template.loader import render_to_string
from celery import shared_task
from django.utils.html import strip_tags
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from backend.models import CustomUser
import os
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse

def send_expiring_email(user):
    """
    Send plan expiry notification email to user
    """
    try:
        profile = user
        subject = f"Your {profile.active_plan.name} Plan Expires Soon!"
        
        # Email content context
        context = {
            'user': user,
            'plan_name': profile.active_plan.name,
            'expiry_date': profile.plan_expiry_date,
            'renewal_url': f"{settings.DEFAULT_DOMAIN}/plans/upgrade",
            'support_email': settings.DEFAULT_SUPPORT_EMAIL,
            'username': user.email.split("@")[0]
        }

        # Render HTML and text versions
        html_message = render_to_string('hiresmarts_emails/plan_expiring.html', context)
        plain_message = render_to_string('hiresmarts_emails/plan_expiring.html', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=strip_tags(plain_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
    except Exception as e:
        # Log error
        print(f"Failed to send expiry email to {user.email}: {str(e)}")
    return True

def send_expired_email(user):
    """
    Send plan expiry notification email to user
    """
    try:
        profile = user
        subject = f"Your {profile.active_plan.name} Plan Expires Soon!"
        
        # Email content context
        context = {
            'user': user,
            'plan_name': profile.active_plan.name,
            'expiry_date': profile.plan_expiry_date,
            'renewal_url': f"{settings.DEFAULT_DOMAIN}/plans/upgrade",
            'support_email': settings.DEFAULT_SUPPORT_EMAIL,
            'username': user.email.split("@")[0]
        }

        # Render HTML and text versions
        html_message = render_to_string('hiresmarts_emails/plan_expiring.html', context)
        plain_message = render_to_string('hiresmarts_emails/plan_expiring.html', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=strip_tags(plain_message),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
    except Exception as e:
        # Log error
        print(f"Failed to send expiry email to {user.email}: {str(e)}")
    return True


def send_welcome_email(user):
    subject = 'Welcome to Reserish!'
    from_email = None  # Uses DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    html_content = render_to_string('hiresmarts_emails/welcome.html', {'username': user.email.split("@")[0]})
    text_content = 'Thank you for registering.'
    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    except Exception as e:
        print(f"rs error")
        raise e  # Raise the exception to be handled by Celery


def send_password_reset_email(user, token):
    subject = 'Password Reset Request'
    from_email = None  # Uses DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    html_content = render_to_string('hiresmarts_emails/password_reset.html', {'token': token})
    text_content = 'Click the link to reset your password.'

    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")
    msg.send()

@shared_task
def send_advertisement_email():
    users = CustomUser.objects.all()
    for user in users:
        subject = "🔥 Hot Deals Just for You!"
        from_email = None
        recipient = [user.email]
        
        html_content = render_to_string("hiresmarts_emails/advertisement.html", {'user':user.email})
        text_content = "Check out our latest offers!"

        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

def send_verification_email(user, request):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    verification_link = f"{os.getenv('EFRONTEND_URL','https://hiresmarts.in')}/verifyemail/{uid}/{token}/"

    subject = 'Verify Your Email Address'
    from_email = None
    to_email = user.email

    html_content = render_to_string('hiresmarts_emails/verify_email.html', {
        'user': user,
        'verification_link': verification_link,
        'username': user.email.split("@")[0]
    })
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
    email.attach_alternative(html_content, "text/html")
    email.send()