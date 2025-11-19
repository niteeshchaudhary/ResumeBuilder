import hashlib
import requests
import uuid
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from .utils.mongolog import log_error,get_logs_mongo
from django.core.files.base import ContentFile
from django.db.models import Count
import hmac
from .utils import emails,enp_emails
from datetime import datetime
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.shortcuts import render
import random
import time
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse,Http404
from django.shortcuts import get_object_or_404
import os
import zipfile
import shutil
import subprocess
from django.conf import settings
from rest_framework.permissions import AllowAny
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
import razorpay
from .authentication import CustomJWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from rest_framework.response import Response
from rest_framework import generics, viewsets,status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
import joblib
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
import bkend_function.enterprise.resume_screen as resume_screener
import bkend_function.jobs.job_scrap as jobsrapper
import bkend_function.individual.specificrating.indsingle as individual_single
import bkend_function.individual.overallrating.individual as individual_overall
from bkend_function.lataxtemplates.sb2 import sb2 as sb2
from bkend_function.lataxtemplates.nitp import nitp as nitp
from bkend_function.lataxtemplates.custom import custom as custom
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import redirect
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from . import extractor
from .models import *
import stat
import re
import json
from reportlab.pdfgen import canvas
import csv
from dotenv import load_dotenv
from pymongo import MongoClient
from django.views.decorators.cache import cache_page
import novu_py
from novu_py import Novu
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.core.cache import cache
from django.contrib.auth.decorators import login_required
from django.http import FileResponse
from datetime import timedelta
from .models import InterviewSlot, InterviewBooking, InterviewSession
from .serializers import InterviewSlotSerializer, InterviewBookingSerializer, InterviewSessionSerializer


client = razorpay.Client(auth=(settings.RAZORPAY_API_KEY, settings.RAZORPAY_API_SECRET))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'), override=False)
MODEL_DIR = os.path.join(BASE_DIR, 'model')

def remove_read_only(func, path, excinfo):
    os.chmod("media/temp_latex", stat.S_IWRITE)  # Change to writable
    os.rmdir(path)  # Remove the directory

@permission_classes([AllowAny])
def home(request):
    if request.GET.get('envar','')!="":
        data = {'message': 'Hello, Django!', 'status': 'success','envar': str(os.environ),'os': os.getenv(request.GET.get('envar',''))}
    else:
        data = {'message': 'Hello, Django!'}
    return JsonResponse(data)

@csrf_exempt
@permission_classes([AllowAny])
def get_error_logs(request, token):
    print( token)
    if token=="myadminlogs":
        return get_logs_mongo(request)
    else:
        return JsonResponse({'error': 'Wrong address'}, status=404)

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def secure_serve_latex(request, user_id, filename):
    if str(request.user.id) != str(user_id):
        raise Http404("Unauthorized")

    path = os.path.join(settings.PRIVATE_MEDIA_ROOT, 'temp_latex', str(user_id), filename)
    if os.path.exists(path):
        return FileResponse(open(path, 'rb'), content_type='application/pdf')
    raise Http404("File not found")

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def secure_serve_profile(request, user_id, filename):
    if str(request.user.id) != str(user_id):
        raise Http404("Unauthorized")

    path = os.path.join(settings.MEDIA_ROOT, 'profiles', str(user_id), filename)
    if os.path.exists(path):
        return FileResponse(open(path, 'rb'), content_type='application/pdf')
    raise Http404("File not found")

@permission_classes([AllowAny])
def mail_test(request):
    to_mail=request.GET.get('to_mail','nkcgreat@gmail.com')
    return send_custom_email(to_mail,request.GET.get('type',''),request)

def send_custom_email(to_mail,mail_type,request=None):
    if(mail_type=="welcome"):
        user=CustomUser.objects.get(email=to_mail)
        try:
            if user.is_enterprise:
                enp_emails.send_welcome_email(user)
            else:
                emails.send_welcome_email(user)
        except Exception as e:
            print(f'Error sending email: {e}')
            log_error("email", str(e)+ to_mail+mail_type)
            return JsonResponse({'error': str(e)}, status=400)
    elif(mail_type=="verify"):
        user=CustomUser.objects.get(email=to_mail)
        try:
            if user.is_enterprise:
                enp_emails.send_verification_email(user, request)
            else:
                emails.send_verification_email(user, request)
        except Exception as e:
            print(f'Error sending email: {e}')
            log_error("email", str(e)+ to_mail+mail_type)
            return JsonResponse({'error': str(e)}, status=400)
    elif(mail_type=="expiry"):
        user=CustomUser.objects.get(email=to_mail)
        try:
            if user.is_enterprise:
                enp_emails.send_expiring_email(user)
            else:
                emails.send_expiring_email(user)
        except Exception as e:
            print(f'Error sending email: {e}')
            log_error("email", str(e)+ to_mail+mail_type)
            return JsonResponse({'error': str(e)}, status=400)
    elif(mail_type=="forgot"):
        user=CustomUser.objects.get(email=to_mail)
        try:
            if user.is_enterprise:
                enp_emails.send_password_reset_email(user,"1234567890")
            else:
                emails.send_password_reset_email(user,"1234567890")
        except Exception as e:
            print(f'Error sending email: {e}')
            log_error("email", str(e)+ to_mail+mail_type)
            return JsonResponse({'error': str(e)}, status=400)
    elif(mail_type=="advertisement"):
        users=CustomUser.objects.all()
        for user in users:
            try:
                if user.is_enterprise:
                    enp_emails.send_advertisement_email(user)
                else:
                    emails.send_advertisement_email(user)
            except Exception as e:
                print(f'Error sending email: {e}')
                log_error("email", str(e)+ to_mail+mail_type)
    else:
        log_error("email", "Invalid email type", to_mail,mail_type)
        return JsonResponse({'error': 'Invalid email type'}, status=400)
        # return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'message': 'Email sent successfully'}, status=200)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@permission_classes([AllowAny])
class PasswordResetRequestView(APIView):
    """
    Handles sending a password reset link to a user's email.
    """
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return JsonResponse({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return JsonResponse({"error": "No user found with this email"}, status=status.HTTP_404_NOT_FOUND)

        # Generate UID and token
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Construct reset link
        
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uidb64}/{token}"
        

        # Email subject and content
        subject = "Password Reset Request"
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = user.email

        context = {
            "username": email.split("@")[0],
            "reset_link": reset_link,
            "site_name": "ResumeUpgrader",  # Or pull dynamically
        }

        # Render HTML template
        html_content = render_to_string("emails/password_reset_email.html", context)
        if user.is_enterprise:
            reset_link = f"{settings.EFRONTEND_URL}/reset-password/{uidb64}/{token}"
            html_content = render_to_string("hiresmarts_emails/password_reset_email.html", context)
            context = {
            "username": email.split("@")[0],
            "reset_link": reset_link,
            "site_name": "HireSmarts",  # Or pull dynamically
        }

        # Send email
        try:

            email_message = EmailMultiAlternatives(subject, "", from_email, [to_email])
            email_message.attach_alternative(html_content, "text/html")
            email_message.send()
        except Exception as e:
            return Response({"error": "Failed to send email", "details": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Password reset link sent"}, status=status.HTTP_200_OK)

@permission_classes([AllowAny])
class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        password = request.data.get("password")
        if not password:
            return Response({"error": "Password is required"}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
            print(uid,user,default_token_generator.check_token(user, token))
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password reset successful"})
            else:
                return Response({"error": "Invalid or expired token"}, status=400)
        except Exception:
            return Response({"error": "Invalid request"}, status=400)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def download_statement(request):
    format_type = request.GET.get('format', 'csv')  # or 'pdf'
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')

    if format_type == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Plan', 'Amount', 'Status', 'Payment ID'])
        
        for t in transactions:
            writer.writerow([
                t.created_at.strftime('%Y-%m-%d %H:%M'),
                t.plan.name,
                t.amount,
                t.status,
                t.payment_id
            ])
            
        return response

    elif format_type == 'pdf':
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="transactions.pdf"'

        p = canvas.Canvas(response)
        y = 800  # Starting Y position
        
        # PDF Header
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, f"Transaction Statement for {request.user.email}")
        y -= 30

        # Table Header
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, y, "Date")
        p.drawString(150, y, "Plan")
        p.drawString(250, y, "Amount")
        p.drawString(350, y, "Status")
        p.drawString(450, y, "Payment ID")
        y -= 20

        # Transactions
        p.setFont("Helvetica", 10)
        for t in transactions:
            y -= 20
            if y < 50:  # Add new page
                p.showPage()
                y = 750
            
            p.drawString(50, y, t.created_at.strftime('%Y-%m-%d'))
            p.drawString(150, y, t.plan.name)
            p.drawString(250, y, f"₹{t.amount}")
            p.drawString(350, y, t.status)
            p.drawString(450, y, t.payment_id)

        p.save()
        return response

    return Response({'error': 'Invalid format'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_us(request):
    # firstName: '',
    # lastName: '',
    # company: '',
    # email: '',
    # phone: '',
    # country: 'IN',
    # message: ''
    print(str(request.data)) 
    name = request.data.get('firstName', '') + ' ' + request.data.get('lastName', '')
    email = request.data.get('email')
    company = request.data.get('company', '')
    phone = request.data.get('phone', '')
    message = request.data.get('message')
    print(name,email,company,phone,message)
    

    if not name or not email or not message:
        return Response({'error': 'All fields are required'}, status=400)

    try:
        emails.send_within_org(str(request.data),request)
        log_error("ContactUS: ", f"{name} {email} {company} {phone} : {message}",request)
        # send_contact_email(name, email, message)
        return Response({'success': 'Message sent successfully'}, status=200)
    except Exception as e:
        log_error("contact_us", str(e), request)
        return Response({'error': 'Failed to send message'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 60)  # Cache for 1 hour
def get_offered_plans(request):
    cache_key = 'offered_plans'
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)
    
    plans = Plan.objects.select_related().order_by('id')
    data = {
        'uplans': PlanSerializer(plans[:3], many=True).data,
        'eplans': PlanSerializer(plans[3:], many=True).data,
    }
    cache.set(cache_key, data, 60 * 60)
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
@cache_page(6000 * 6000)
def get_plans(request):
    plans = None
    usertype=request.data.get("usertype","u")
    if usertype=="u":
        plans=Plan.objects.order_by('id')[:3]
    else:
        plans=Plan.objects.order_by('id')[3:]
    

    active_plan_id = request.user.active_plan_id if request.user.active_plan_id else 1
    print(active_plan_id,request.user,request.user.active_plan_id)
    return Response({
        'plans': PlanSerializer(plans, many=True).data,
        'active_plan': active_plan_id
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def use_google_auth(request):
    """
    Handles Google OAuth authentication.
    Expects a POST with 'token' (Google ID token) in the body.
    Returns user info and JWT tokens if successful.
    """
    print(request.data)
    token = request.data.get('token')
    referral_code = request.data.get('referralCode', None)
    if not token:
        return Response({'error': 'Token is required'}, status=400)

    try:
        # Specify the CLIENT_ID of the app that accesses the backend
        CLIENT_ID = settings.GOOGLE_CLIENT_ID
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)

        email = idinfo.get('email')
        picture = idinfo.get('picture', '')

        # Get or create user
        user, created = CustomUser.objects.get_or_create(email=email, defaults={
            'email': email,
            'is_enterprise': False,
            'is_active': True,
        })

        if created:
            user.plan_duration=-1
            if user.is_enterprise==True:
                # user_profile.rid=
                user.plan_duration=0
                user.plan_expiry_date=timezone.now() + relativedelta(days=7)
                user.active_plan_id=4

            user_folder=str(user.id)
            user.profile_picture = f'profiles/{user_folder}/default.jpg'
            user.save()
            try:
                response = requests.get(picture)
                if response.status_code == 200:
                    if not os.path.exists(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}')):
                        os.makedirs(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}'))
                    file_name = f"profiles/{user_folder}/default.jpg"
                    file_path = os.path.join(settings.MEDIA_ROOT, file_name)
                    # Save the file to media/user directory
                    with open(file_path, 'wb') as f:
                        f.write(response.content)
                    # Optional: If CustomUser has a `profile_picture` FileField or ImageField
                    # if hasattr(user, 'profile_picture'):
                    #     user.profile_picture.save(file_name, ContentFile(response.content), save=True)

            except Exception as e:
                log_error("email", e, request)
                print(f"Failed to save profile picture: {e}")
            # Send welcome email and notification in background
            try:
                from .tasks import send_welcome_email_and_notification
                send_welcome_email_and_notification.delay(user.email, user.is_enterprise)
                print("Welcome email and notification queued for background processing")
            except Exception as e:
                print(f'Error queuing welcome tasks: {e}')
                log_error("email", e, request)
                
            if referral_code:
                try:
                    referral_code_obj = ReferralCode.objects.get(code=referral_code, is_active=True)

                    
                    application = ReferralCodeApplication.objects.create(
                    user=user,
                    applied_referral_code=referral_code_obj
                    )
                    
                    UserReferral.objects.create(
                        referrer=referral_code_obj.user,
                        referred_user=user,
                        referral_code=referral_code_obj
                    )
                except ReferralCode.DoesNotExist:
                    pass  # Invalid referral code, ignore
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        data = {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            # 'user': {
            #     'email': user.email,
            #     'first_name': user.first_name,
            #     'last_name': user.last_name,
            #     'is_enterprise': user.is_enterprise,
            #     'profile_picture': user.profile_picture.url if user.profile_picture else picture,
            # }
        }
        return Response(data, status=200)
    except ValueError as e:
        print(e)
        log_error("google_auth", str(e), request)
        return Response({'error': 'Invalid token', 'details': str(e)}, status=400)
    except Exception as e:
        print(e)
        log_error("google_auth", str(e), request)
        return Response({'error': 'Authentication failed', 'details': str(e)}, status=500)

@api_view(['POST'])
@csrf_exempt
def cashfree_webhook(request):
    # Verify signature
    signature = request.headers.get('x-webhook-signature')
    # Implement signature verification here


    # Process webhook
    order_details=request.data
    order_id = request.data.get('order_id')
    order_status = request.data.get('order_status')
    try:
        trx = Transaction.objects.get(order_id=order_id)
        if order_details.get("order_status","Failed")=="PAID": 
            trx.status = "success"
            user_profile, created = CustomUser.objects.get_or_create(email=order_details["customer_details"]["customer_emai"])
            user_profile.active_plan = trx.plan
            mp={"price_month":1,"price_qyear":3,"price_hyear":6,"price_year":12}
            user_profile.plan_duration=mp[order_details['order_tags']['discount']]
            user_profile.plan_activated_on=datetime.now()
            user_profile.plan_expiry_date= timezone.now() + relativedelta(months=+mp[order_details['order_tags']['discount']])
            user_profile.save()
            if user_profile.is_enterprise==True:
                sendNotification(user_profile.email, title="Congratulations", body="We have successfully recieved your payment and your plan is now upgraded",workflow_id="onboarding-demo-workflow-enp")
            else:
                sendNotification(user_profile.email, title="Congratulations", body="We have successfully recieved your payment and your plan is now upgraded")
            print(order_details)
            return Response({'success': True, 'transaction_id': order_details["order_id"],'msg':'Payment is successful'}, status=200)
        else:
            trx.status="Failed"
    except Transaction.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    return Response({'status': 'pata nahi'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CustomJWTAuthentication])
def initiate_cashfree_payment(request):
    amount = request.data.get('amount')
    notes =request.data.get('notes')
    user=request.user
    mid="e" if user.is_enterprise else "u"
    frontend_url = settings.EFRONTEND_URL if user.is_enterprise else settings.FRONTEND_URL

     # Get requested plan
    print(request.data)
    # {'name': 'dsfsd', 'email': 'asdf@gmail.com', 'phone': '9876543210', 
    # 'amount': 29, 'planid': 2, 'description': ''}
    requested_plan=None
    try:
        requested_plan = Plan.objects.get(pk=request.data.get('planid'))
        print(requested_plan,"****")
    except Plan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)
    
    if not amount:
        return Response({'error': 'Amount is required'}, status=400)
    
    # Generate a unique order_id
    print(requested_plan,"}}}}}}}")
    order_id = f"ORDER_{uuid.uuid4().hex[:10]}_{int(datetime.now().timestamp())}"
    # t_amount = int(float(requested_plan.price) * 100) 
    amount_req=float(eval(f"Plan.objects.get(pk=notes['id']).{notes['discount']}"))
    amount_rec=float(request.data.get('amount'))
    print(amount_req,amount_rec)
    if amount_req>amount_rec:
        return Response({'error': 'Incorrect Amount is passed'}, status=400)

    # order = PaymentOrder.objects.create(
    #     order_id=order_id,
    #     amount=amount,
    # )
    
    # Prepare Cashfree request
    url = f"{settings.CASHFREE_BASE_URL}/orders"

    headers = {
        "Content-Type": "application/json",
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
    }
    print(settings.CASHFREE_APP_ID,"-",settings.CASHFREE_SECRET_KEY,url)
    # # {'name': 'dsfsd', 'email': 'asdf@gmail.com', 'phone': '9876543210', 'amount': 29, 'planid': 2, 'description': ''}
    
    payload = {
        "order_id": order_id,
        "order_amount": float(amount),
        "order_currency": "INR",
        "order_note": "Payment for order",
        "customer_details": {
            "customer_id": str(request.data.get('customer_id', request.user.id)),
            "customer_name": request.data.get('customer_name', request.data.get("name")),
            "customer_email": request.data.get('customer_email', request.data.get("email")),
            "customer_phone": request.data.get('customer_phone', request.data.get("phone"))
        },
        "order_meta": {
            "return_url": request.data.get('return_url', f'{frontend_url}/{mid}/payment-status?order_id={order_id}'),
            "notify_url": request.data.get('notify_url',f"https://reserishmain.nkcs.site/reserish/api/cashfree/webhook")
        },
        "order_tags": {
            "planid": str(request.data.get('planid')),
            "company": "ResumeUpgrader",
            "id": str(notes["id"]),
            "name": str(notes["name"]),
            "price": str(notes["price"]),
            "level": str(notes["level"]),
            "discount": str(notes["discount"]),
        }
    }

    
    
    response = requests.post(url, json=payload, headers=headers)

    # ----> {'cf_order_id': 4184550496, 'created_at': '2025-05-22T01:43:28+05:30',
    #  'customer_details': {'customer_id': 'cust_123', 'customer_name': 'John Doe',
    #  'customer_email': 'john@example.com', 'customer_phone': '9999999999',
    #  'customer_uid': None}, 'entity': 'order', 'order_amount': 29.0,
    #  'order_currency': 'INR', 'order_expiry_time': '2025-06-21T01:43:28+05:30', 
    # 'order_id': 'ORDER_eb56fa9df1_1747858407',
    #  'order_meta': {'return_url': 
    # 'https://localhost:5173/payment-status?order_id={order_id}', 
    # 'notify_url': None, 'payment_methods': None}, 'order_note': 'Payment for order',
    #  'order_splits': [], 'order_status': 'ACTIVE', 'order_tags': None,
    #  'payment_session_id': 
    # 'session_1nxsKNGauPgeNtnYjbMdwayI-EX5rb-E8sxDyIOMe314_TIgFCKzEYdewj3HzMH9taFciH6MNYntUUarZOD7dem6uB7supy3E3JFziN33FtV1zwm_rnoeiE4So8payment', 
    # 'payments': {'url':
    #  'https://api.cashfree.com/pg/orders/ORDER_eb56fa9df1_1747858407/payments'},
    #  'refunds': {'url': 
    # 'https://api.cashfree.com/pg/orders/ORDER_eb56fa9df1_1747858407/refunds'},
    #  'settlements': {'url': 'https://api.cashfree.com/pg/orders/ORDER_eb56fa9df1_1747858407/settlements'}, 
    # 'terminal_data': None}
    print(response.json(),response.status_code,"**")


    
    
    if response.status_code == 200:
        data = response.json()
        print("---->",data)
        
        # Save to database
        order = Transaction.objects.create(
                        user=request.user,
                        plan_id=request.data.get('planid'),
                        amount=amount,
                        payment_id=f"PAYMENT_{uuid.uuid4().hex[:10]}_{int(datetime.now().timestamp())}",
                        order_id=data.get("order_id"),
                        signature=f"SIGNATURE_{uuid.uuid4().hex[:10]}_{int(datetime.now().timestamp())}",
                        status='incomplete'
                    )
        return Response({
            'order_id': data.get("order_id"),
            'payment_session_id': data['payment_session_id'],
            'cf_order_id': data['cf_order_id']
        })
    else:
        print("EE",response.status_code)
        return Response({'error': 'Failed to create payment order'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CustomJWTAuthentication])
def cashfree_payment_status(request):
    # Verify signature
    
    # url = "https://sandbox.cashfree.com/pg/orders/order_106095652xSugLB66rWMW9CVlUnYY7MGbKc"

    # headers = {
    #     "x-client-id": "TEST10609565e199fedb0009469510ba56590601",
    #     "x-api-version": "2025-01-01",
    #     "x-request-id": "",
    #     "x-idempotency-key": ""
    # }

    # response = requests.request("GET", url, headers=headers)

    # print(response.json())
    order_id = request.data.get('order_id')
    print(order_id)
    headers = {
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": "2025-01-01",
        "x-request-id": "",
        "x-idempotency-key": ""
    }
    url = f"{settings.CASHFREE_BASE_URL}/orders/{order_id}"

    response = requests.request("GET", url, headers=headers)
    order_details=response.json()
    print(response.json())
    
    try:
        trx = Transaction.objects.get(order_id=order_id)
        if order_details.get("order_status","Failed")=="PAID": 
            trx.status = "success"
            user_profile, created = CustomUser.objects.get_or_create(email=request.user)
            user_profile.active_plan = trx.plan
            mp={"price_month":1,"price_qyear":3,"price_hyear":6,"price_year":12}
            user_profile.plan_duration=mp[order_details['order_tags']['discount']]
            user_profile.plan_activated_on=datetime.now()
            user_profile.plan_expiry_date= timezone.now() + relativedelta(months=+mp[order_details['order_tags']['discount']])
            user_profile.save()
            print(order_details)
            trx.save()
            if user_profile.is_enterprise==True:
                sendNotification(user_profile.email, title="Congratulations", body="We have successfully recieved your payment and your plan is now upgraded",workflow_id="onboarding-demo-workflow-enp")
            else:
                sendNotification(user_profile.email, title="Congratulations", body="We have successfully recieved your payment and your plan is now upgraded")
            return Response({'success': True, 'transaction_id': order_details["order_id"],'msg':'Payment is successful'}, status=200)
        else:
            trx.status="Failed"
            trx.save()
            return Response({'success': False, 'transaction_id': order_details["order_id"],'msg':'Payment Failed'}, status=200)    
    except Transaction.DoesNotExist as e:
        log_error("Order not found (cash free payment status):", str(e))
        return Response({'error': 'Order not found'}, status=404)
    

    
@api_view(['POST'])
def payment_webhook(request):
    # Verify signature
    signature = request.headers.get('x-webhook-signature')
    # Implement signature verification here


    # Process webhook
    order_details=request.data
    order_id = request.data.get('order_id')
    order_status = request.data.get('order_status')
    try:
        trx = Transaction.objects.get(order_id=order_id)
        if order_details.get("order_status","Failed")=="PAID": 
            trx.status = "success"
            user_profile, created = CustomUser.objects.get_or_create(email=order_details["customer_details"]["customer_emai"])
            user_profile.active_plan = trx.plan
            mp={"price_month":1,"price_qyear":3,"price_hyear":6,"price_year":12}
            user_profile.plan_duration=mp[order_details['order_tags']['discount']]
            user_profile.plan_activated_on=datetime.now()
            user_profile.plan_expiry_date= timezone.now() + relativedelta(months=+mp[order_details['order_tags']['discount']])
            user_profile.save()
            print(order_details)
            return Response({'success': True, 'transaction_id': order_details["order_id"],'msg':'Payment is successful'}, status=200)
        else:
            trx.status="Failed"
    except Transaction.DoesNotExist as e:
        log_error("Transaction not exists (paymentwebhook):", str(e))
        return Response({'error': 'Order not found'}, status=404)

    return Response({'status': 'pata nahi'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CustomJWTAuthentication])
def initiate_razor_payment(request):
    # Get requested plan
    user=request.user
    try:
        requested_plan = Plan.objects.get(pk=request.data.get('plan_id'))
    except Plan.DoesNotExist as e:
        log_error("Plan does not exists (initiate_razor_payment):", str(e))
        return Response({'error': 'Plan not found'}, status=404)

    # Get current plan
    try:
        active_plan = request.user.userprofile.active_plan
    except CustomUser.DoesNotExist as e:
        log_error("Customer not exist (initiate_razor_payment):", str(e))
        return Response({'error': 'User profile not found'}, status=404)

    # Validation
    if active_plan and requested_plan.level <= active_plan.level:
        return Response({'error': 'Please select a higher plan'}, status=400)

    
    # Create Razorpay Order
    amount = int(float(requested_plan.price) * 100)  # Convert to paise
    currency = "INR"
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    try:
        order = client.order.create({
            "amount": amount,
            "currency": currency,
            "payment_capture": "1",
            "notes": {
                "user_id": request.user.id,
                "plan_id": requested_plan.id
            }
        })
    except Exception as e:
        log_error("Payment gateway error (initiate_razor_payment):", str(e))
        return Response({'error': 'Payment gateway error'}, status=500)

    return Response({
        'order_id': order['id'],
        'key': settings.RAZORPAY_KEY_ID,
        'amount': amount,
        'currency': currency,
        'user_name': request.user.get_full_name(),
        'user_email': request.user.email
    })
    # return Response({'payment_url': f'/payment/{requested_plan.id}'})

def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = CustomUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist) as e:
        log_error("(verify_email):", str(e))
        user = None

    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return JsonResponse({'info': 'Account Verified.'}, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'info': 'Account can not be Verified'}, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
@api_view(['POST'])
def resendVerificationLink(request):
    email=request.data.get("email")
    try:
        print(email)
        result=send_custom_email(email,"verify",request)
        if result.status_code==200:
            print("Verification Email sent successfully")
            return JsonResponse({'message': "Verification Email sent successfully"}, status=200)
        else:
            print("Verification Email sending failed")   
            raise Exception("Email sending failed"+str(result))
    except CustomUser.DoesNotExist as e:
        print(f"User Doesn't Exist: {e}")
        log_error("verification email", e, request)
        return JsonResponse({'error': "User doesn't Exists"}, status=404)
    except Exception as e:
        print(f'Error sending verification email: {e}')
        log_error("verification email", e, request)
        return JsonResponse({'error': e}, status=400)

@permission_classes([AllowAny])
class RegisterView(generics.CreateAPIView):
    # queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(request.data,"*****")
        serializer.is_valid(raise_exception=True)
        user=serializer.save()
        try:
            user_folder=str(user.id)
            if not os.path.exists(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}')):
                os.makedirs(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}'))
                src_image_path = os.path.join(settings.BASE_DIR, 'backend/images', 'default.png')
                dest_image_path = os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}', f"default.png")
                shutil.copy(src_image_path, dest_image_path)
            user_profile, created = CustomUser.objects.get_or_create(email=user.email)
            user_profile.plan_duration=-1
            if user.is_enterprise==True:
                # user_profile.rid=
                user_profile.plan_duration=0
                user_profile.plan_expiry_date=timezone.now() + relativedelta(days=7)
                user_profile.active_plan_id=4
            user_profile.profile_picture = f'profiles/{user_folder}/default.png'
            user_profile.save()
        except Exception as e:
            print(f'Error saving user data: {e}--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------')
            log_error("email", e, request)
            return JsonResponse({'error': e}, status=400)
        # Send welcome email and notification in background
        try:
            from .tasks import send_welcome_email_and_notification, send_verification_email_task
            send_welcome_email_and_notification.delay(user.email, user.is_enterprise)
            send_verification_email_task.delay(user.email, request.data)
            print("Welcome email, notification, and verification email queued for background processing")
        except Exception as e:
            print(f'Error queuing email tasks: {e}')
            log_error("email", e, request)
        headers = self.get_success_headers(serializer.data)
        return Response({'info': 'Account created.',"is_enterprise":user.is_enterprise}, status=status.HTTP_201_CREATED, headers=headers)

@permission_classes([AllowAny])
class LoginUView(APIView):
    def post(self, request, *args, **kwargs):
        
        username = request.data.get('email')
        password = request.data.get('password')

        # Ensure username and password are provided
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=username)
        except CustomUser.DoesNotExist as e:
            log_error("LoginUView", username+str(e),request)
            return Response({"detail": "User Does Not exists"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"detail": "Please verify your email before logging in.","verify":False}, status=status.HTTP_403_FORBIDDEN)


        # Authenticate the user
        user = authenticate(request=request,email=username, password=password)

        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # user.is_authenticated=True
        print(user,user.is_authenticated)

        if user is not None and user.is_enterprise==False:
            print(user.is_enterprise,"|-"*1)
            login(request, user)
            
            # Create access token
            access_token = RefreshToken.for_user(user)
            
            # Include both access and refresh tokens in the response
            response_data = {
                'access_token': str(access_token.access_token),
                'refresh_token': str(access_token),
                "is_enterprise": user.is_enterprise
            }

            return Response(response_data, status=status.HTTP_200_OK)
        elif user.is_enterprise==True:
            return Response({'error': 'Its an Enterprise account'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@permission_classes([AllowAny])    
class LoginEView(APIView):
    def post(self, request, *args, **kwargs):
        
        username = request.data.get('email')
        password = request.data.get('password')

        # Ensure username and password are provided
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(email=username, password=password)
        print(user)
        

        if user is not None and user.is_enterprise==True:
            print(user.is_enterprise,"|-"*1)
            login(request, user)
            
            # Create access token
            access_token = RefreshToken.for_user(user)
            
            # Include both access and refresh tokens in the response
            response_data = {
                'access_token': str(access_token.access_token),
                'refresh_token': str(access_token),
                "is_enterprise": user.is_enterprise
            }

            return Response(response_data, status=status.HTTP_200_OK)
        elif user.is_enterprise!=True:
            return Response({'error': 'Not an Enterprise account'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
def remove_directory(directory):
    try:
        if(os.path.exists(directory)):
            for item in os.listdir(directory):
                print(item)
                item_path = os.path.join(directory, item)
                if os.path.isfile(item_path):
                    os.chmod(item_path, stat.S_IWRITE)
                    os.remove(item_path)
                    print(f'Removed file: {item_path}')
                elif os.path.isdir(item_path):
                    print(f'Removing directory: {item_path}')
                    remove_directory(item_path)
                    
            # os.chmod('media/temp_resumes/6', stat.S_IWRITE)
            # os.rmdir(directory) 
            # print(f'Removed directory: {directory}')
        else:
            print(f'Directory {directory} does not exist')
    except OSError as e:
        log_error("remove_directory", str(e))
        try:
            shutil.rmtree(directory, onerror=remove_read_only)
            print(f'Removed directory: {directory}')
        except Exception as e:
            print(f'Error_removing directory {directory}: {e}')
        print(f'Error removing directory {directory}: {e}')

def replace_placeholders(text, replacements):
    # Define a regex pattern to match placeholders like #<name>, #<info>
    pattern = re.compile(r"#<(\w+)>")

    # Function to get the replacement from the dictionary or leave it unchanged
    def replacer(match):
        placeholder = match.group(1)  # Extract the placeholder name
        return replacements.get(placeholder, f"#<{placeholder}>")  # Replace or leave unchanged

    # Replace placeholders in the text using the replacer function
    return pattern.sub(replacer, text)

        

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class CompileLatexView(APIView):
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        print("User:", request.user)
        print("Is Authenticated:", request.user.is_authenticated)
        print("Is Active:", request.user.is_active)
        user=request.user
        user_folder=str(user.id)
        # latex_code = request.data.get('code', '')
        # user_info = request.data.get('info', '')
        # user_info = request.data.get('info', '')
        # latex_code =replace_placeholders(latex_code, user_info)
        # print(latex_code)
        sample_resume_json = request.data.get('resume', {})
        useUserData=request.data.get('useUserData',True)
        template=request.data.get('template','sb2')
        print("_*"*20)
        try:
            if useUserData:
                storeData(sample_resume_json,user)
        except Exception as e:
            log_error("Error saving user data CompileLatexView :", str(e))
            print(f'Error saving user data: {e}--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------')
            print("_"*20)
            print("_"*20)
            # return JsonResponse({'error': 'Error saving user data'}, status=400)
        
        print("_"*10)
        user_profile, created = CustomUser.objects.get_or_create(email=request.user)

        # latex_code=eval(f"{template}(sample_resume_json,user_profile)")
        latex_code=eval(f"{template}(sample_resume_json,user_profile)")
        # print(latex_code)


        # Ensure the directory exists
        random_num=str(time.time()+ random.randint(1,10))
        output_dir = f"media/temp_latex/{user_folder}"
        remove_directory(output_dir) 
        # remove_directory(f'media/temp_latex/{user_folder}')
        os.makedirs(output_dir, exist_ok=True)

        # Create a temporary LaTeX file
        with open(f'media/temp_latex/{user_folder}/temp{random_num}.tex', 'w') as f:
            f.write(latex_code)


        abs_path = os.path.join(settings.BASE_DIR, f'media/temp_latex/{user_folder}/temp{random_num}.tex')
        print(type(abs_path),abs_path,type(random_num),random_num,type(user_folder),user_folder,type(output_dir),output_dir)
        latex_host=os.getenv('LATEX_SERVICE_URL','http://latex:8081')
        print(latex_host)
        print(latex_host.split('/'))
        if latex_host.split('/')[2].startswith("localhost") or latex_host.split('/')[2].startswith("127.0.0.1"):
            # Compile the LaTeX code using pdflatex
            try:
                log_path = os.path.join(output_dir, 'output.log')
                with open(log_path, 'w') as log_file:
                    subprocess.run(
                        ['pdflatex', '-interaction=nonstopmode', '-output-directory', output_dir, abs_path],
                        check=True,
                        stdout=log_file,
                        stderr=log_file
                    )
            except subprocess.CalledProcessError as e:
                log_error("Error saving user data CompileLatexView :", str(e))
                pdf_url = f'media/temp_latex/{user_folder}/temp{random_num}.pdf'
                return JsonResponse({'pdf_url': pdf_url})
                # return Response({'error': 'Compilation failed'}, status=status.HTTP_400_BAD_REQUEST)
        else:    
            response = requests.post(f"{latex_host}/compile/", json={"output_dir":output_dir,"abs_path":abs_path,"user_folder":user_folder,"random_num":random_num})
       
        # Return the compiled PDF
        pdf_url = f'media/temp_latex/{user_folder}/temp{random_num}.pdf'
        return JsonResponse({'pdf_url': pdf_url})

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def uploadProfilePic(request):
    user=request.user
    user_folder=str(user.id)
    if request.FILES.get('profile_pic'):
        user=request.user
        user_folder=str(user.id)
        uploaded_file = request.FILES['profile_pic']
        fs = FileSystemStorage()
        file_path = os.path.join('profiles',user_folder,uploaded_file.name)
        if not os.path.exists(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}')):
            os.makedirs(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}'))

        # Delete existing files in the user's folder
        for i in os.listdir(os.path.join(settings.BASE_DIR,f'media/profiles/{user_folder}')):
            print(i)
            fs.delete(f"profiles/{user_folder}/{i}")
        filename = fs.save(file_path, uploaded_file)
        filename = filename.split('/')[-1]
        user_profile, created = CustomUser.objects.get_or_create(email=request.user)
        user_profile.profile_picture = f'profiles/{user_folder}/{filename}'
        user_profile.save()
        return JsonResponse({'message': 'File uploaded successfully', 'filename': f'/media/profiles/{user_folder}/{filename}'})
    
    return JsonResponse({'error': 'No file uploaded'}, status=400)


@api_view(['GET', 'PUT'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def user_profile(request):

    user_profile, created = CustomUser.objects.get_or_create(email=request.user)

    if request.method == 'GET':
        serializer = UserSerializer(user_profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def resume_parser(request):
    user=request.user
    user_folder=str(user.id)
    dir=os.path.join(settings.BASE_DIR,f'media/grader/{user_folder}/')
    files = [f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    filename=files[0]
    data=individual_overall.get_resume_json(f"media/grader/{user_folder}/{filename}", 2500)
    # data = extractor.extract_resume_details(f"media/grader/{user_folder}/{filename}")
    # data = individual_single.extract_text_from_pdf(f"media/grader/{user_folder}/{filename}")
    # data = individual_overall.extract_text_from_pdf(f"media/grader/{user_folder}/{filename}")
    return JsonResponse(data,safe=False, status=200)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_rephrased_content(request):
    user=request.user
    data=individual_overall.get_reprased_text(request.data["client_prompt"],request.data["text"],request.data["pasttext"], 100)
    print("**",data)
    return JsonResponse({"data":data},safe=False, status=200)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_job_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        user=request.user
        try:
            job_folder=str(request.data.get('jobId', ''))
            if not job_folder:
                return JsonResponse({'error': 'Job ID is required'}, status=400)
            uploaded_file = request.FILES['file']
            fs = FileSystemStorage()
            file_path = os.path.join('jobs',job_folder, f"{user.id}.pdf")
            if not os.path.exists(os.path.join(settings.BASE_DIR,f'media/jobs/{job_folder}')):
                os.makedirs(os.path.join(settings.BASE_DIR,f'media/jobs/{job_folder}'))

            # Delete existing files in the user's folder
            if f'{user.id}.pdf' in os.listdir(os.path.join(settings.BASE_DIR,f'media/jobs/{job_folder}')):
                print('{user.id}.pdf')
                fs.delete(f"jobs/{job_folder}/{user.id}.pdf")
            filename = fs.save(file_path, uploaded_file)
            filename = filename.split('/')[-1]
            return JsonResponse({'message': 'File uploaded successfully','filepath':file_path, 'filename': filename})
        except Exception as e:
            log_error("upload_job_file", str(e))
            print(f'Error uploading file: {e}')
            return JsonResponse({'error': 'Error uploading file'}, status=500)
    return JsonResponse({'error': 'No file uploaded'}, status=400)

# csrf_exempt  # Disable CSRF protection for this view (only for demonstration)
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_file(request):
    # if 'file' not in request.FILES:
    #     return Response({'error': 'No file provided'}, status=400)
    
    # file = request.FILES['file']
    # if file.size > 5 * 1024 * 1024:  # 5MB limit
    #     return Response({'error': 'File too large'}, status=400)
    
    if request.method == 'POST' and request.FILES.get('file'):
        user=request.user
        user_folder=str(user.id)
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage()
        file_path = os.path.join('grader',user_folder, uploaded_file.name)
        if not os.path.exists(os.path.join(settings.BASE_DIR,f'media/grader/{user_folder}')):
            os.makedirs(os.path.join(settings.BASE_DIR,f'media/grader/{user_folder}'))

        # Delete existing files in the user's folder
        for i in os.listdir(os.path.join(settings.BASE_DIR,f'media/grader/{user_folder}')):
            print(i)
            fs.delete(f"grader/{user_folder}/{i}")
        filename = fs.save(file_path, uploaded_file)
        filename = filename.split('/')[-1]
        return JsonResponse({'message': 'File uploaded successfully', 'filename': filename})
    return JsonResponse({'error': 'No file uploaded'}, status=400)

# @csrf_exempt
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class BulkResumeUpload(APIView):
    def post(self, request):
        user=request.user
        k=int(request.POST.get('k'))
        # Extract form data
        print(request.user)
        user=request.user
        user_id=str(user.id)
        job_description = request.POST.get('jobDescription')

        # Handle the uploaded ZIP file
        zip_file = request.FILES.get('zipFile')
        # if(os.path.exists(f"media/temp_resumes/{user_id}/resume_src")):
        #     os.rename(f"media/temp_resumes/{user_id}/resume_src",f"media/temp_resumes/{user_id}/resume_src{random.randint(1,100000)}")
        
        output_dir = f"media/temp_resumes/{user_id}"
        flname='.'.join(zip_file.name.split('.')[:-1])
        path_wzip=f"{output_dir}/{flname}"
        
        # try:
        #     os.rmdir(output_dir, onerror=remove_read_only)  # Remove the empty directory
        # except Exception as e:
        #     print(f'Error Removing directory {output_dir}: {e}')
        #     return JsonResponse({'status': 'error', 'message': f'Error removing directory {output_dir}: {e}'}, status=400)
        
        remove_directory(output_dir) 
        # remove_directory(f'media/temp_latex/{user_folder}')
        # os.makedirs(output_dir, exist_ok=True)

        print('ZIP File:', zip_file)
        if zip_file:
            fs = FileSystemStorage()
            filename = fs.save(f"temp_resumes/{user_id}/{zip_file.name}", zip_file)
            print('ZIP File:', filename)
            zip_file_url = fs.url(filename)
            print('ZIP File URL:', zip_file_url)
            try:
                print(fs.base_location)
                with zipfile.ZipFile(str(fs.base_location)+f"/temp_resumes/{user_id}/{zip_file.name}", 'r') as zip_ref:
                    # Extract all contents
                    zip_ref.extractall(path_wzip)
                    print(f"Unzipped contents to {output_dir}")
            except Exception as e:
                log_error("BulkResumeUpload : Error extracting ZIP file ", str(e))
                print(f'Error extracting ZIP file: {e}')
                return JsonResponse({'status': 'error', 'message': f'Error extracting ZIP file: {e}'}, status=400)

        # Save form data (you can save to database here)
        print('Job Description:', job_description)
        
        # print('ZIP File URL:', zip_file_url)
        # return bulk_resume_upload_results(user_id,job_description,str(fs.base_location)+"/"+filename.split('.')[0],n=k)

        return bulk_resume_upload_results(user_id,job_description,str(fs.base_location)+"/"+filename.split('.')[0],n=k)
    # return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

def bulk_resume_upload_results(user_id,job_role,folder_path, n=5, batch_size=100):
    print(n,"****************",folder_path," *|* ")
    output_folder = f"media/temp_resumes/{user_id}/shortlisted_resumes"
    shortlisted_resumes = resume_screener.process_large_scale_resumes(job_role, folder_path, output_folder, n=n, batch_size=batch_size)
    # shortlisted_resumes += resume_screener.process_large_scale_resumes(job_role, folder_path, output_folder, n=n, batch_size=batch_size)

    print(f"Top {n} resumes have been copied to the folder '{output_folder}':")
    for resume, similarity in shortlisted_resumes:
        print(f"{resume} (Similarity: {similarity:.2f})")

    zip_file = resume_screener.create_zip_of_resumes(output_folder,f"shortlisted_resumes{time.time()}.zip")
    print(f"Shortlisted resumes have been zipped into: {zip_file}")

    return JsonResponse({'status': 'success', 'message': 'Resumes shortlisted successfully', 'zip_file': zip_file})

@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_templates(request):
    print("User:", request.user)
    print("Is Authenticated:", request.user.is_authenticated)
    print("Is Active:", request.user.is_active)
    print("Request Host:", request.get_host())
    dbtemplatesObj=list(TemplateSerializer(Templates.objects.all(), many=True).data)
    dbtemplates=[i["title"] for i in dbtemplatesObj]
    

    templates_dir = os.path.join(settings.BASE_DIR,'media','latex_templates')
    templates = []
    for i,f in enumerate(os.listdir(templates_dir)):
        if f.endswith('.txt') and dbtemplates.count(f.split(".")[0])==0:
            rmtxt=f.split(".")[0]
            templates.append(
                {
                    "id": i,
                    "title": rmtxt,
                    "description": "Resume template",
                    "category": "Resume",
                    "image": f"http://{request.get_host()}/reserish/media/latex_templates/images/{rmtxt}.png",
                } 
            )
            Templates.objects.update_or_create(
                title=rmtxt,
                description="Resume template",
                category="Resume",
                image=f"http://{request.get_host()}/reserish/media/latex_templates/images/{rmtxt}.png",
            )


    print(templates,dbtemplatesObj)
    return JsonResponse(templates+dbtemplatesObj, safe=False)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def specific_rating(request):
    user=request.user
    user_folder=str(user.id)
    data = request.data
    dir=os.path.join(settings.BASE_DIR,f'media/grader/{user_folder}/')
    files = [f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    fl=files[0]
    if fl.endswith('.pdf'):
        text = individual_single.extract_text_from_pdf(dir+fl)
    elif fl.endswith('.docx'):
        text = individual_single.extract_text_from_docx(dir+fl)

    # rating = individual_single.rate_resume(text, data["description"]) # Rate the resume
    result = individual_overall.rate_resume(data["description"],text)
    print(type(result))
    if isinstance(result, str):
        try:
            result = json.loads(result)
        except Exception as e:
            print("Error parsing result:", e)
            result = result.rsplit(',')[0]+"])"
            try:
                result = json.loads(result)
            except Exception:
                for i in result:
                    if(i.isdigit()):
                        result = {'score': i, 'tips': 'Not Available.'}
                        break
                    else:
                        print("Error parsing result:", i)
                else:
                    result = {'score': '0', 'tips': 'Not Available.-'}

    print("Result:", result, "Type:", type(result) )
    return JsonResponse({'rating':result.get('score', '0'),'tips':result.get('tips','Not Available')}, status=200)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def overall_rating(request):
    user=request.user
    print("enter")
    analysis = request.data.get('analysis', 'Brief')
    
    user_folder=str(user.id)
    dir=os.path.join(settings.BASE_DIR,f'media/grader/{user_folder}/')
    files = [f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    fl=files[0]
    print("file-",fl)
    token_size = 512 if analysis == 'Brief' else 1024
    print("analysis-",analysis," ",token_size)
    results = individual_overall.process_resume(os.path.join(dir,fl), token_size)
    individual_overall.save_results_to_json(results, "./myoutput.json")
    print("Done dana done")
    # output_file = "resume_results.json"
    # save_results_to_json(results, output_file)
    # if fl.endswith('.pdf'):
    #     text = individual_overall.extract_text_from_pdf(dir+fl)
    # elif fl.endswith('.docx'):
    #     text = individual_overall.extract_text_from_docx(dir+fl)

    # rating = individual_single.rate_resume(text) # Rate the resume
    print(results)
    return JsonResponse(results, status=200)

def sendNotification(user, title=None, body=None,workflow_id="onboarding-demo-workflow"):
    print(f"Notification...")
    try:
        with Novu(
            secret_key=os.environ['NOVU_SECRET_KEY']
        ) as novu:
            res = novu.trigger(trigger_event_request_dto=novu_py.TriggerEventRequestDto(
                workflow_id=workflow_id,
                to= user,
                payload={
                    "body": body,
                    "subject": title if title!=None else "Hi "+user.split("@")[0],
                }
            ))
        # Send the notification (you can implement your own logic here)
        print(f"Notification sent to {user}: {title} - {body}")
    except Exception as e:
        print(f"Error sending notification to {user}: {e}")
        log_error("sendNotification", str(e))

@csrf_exempt
def submit_job(request):
    if request.method == 'POST':
        # Extract form data
        job_title = request.POST.get('jobTitle')
        job_description = request.POST.get('jobDescription')
        required_skills = request.POST.get('requiredSkills', '').split(',')
        work_experience = request.POST.get('workExperience')

        # Handle the uploaded ZIP file
        zip_file = request.FILES.get('zipFile')
        print('ZIP File:', zip_file)
        if zip_file:
            fs = FileSystemStorage()
            filename = fs.save(zip_file.name, zip_file)
            print('ZIP File:', filename)
            zip_file_url = fs.url(filename)
            print('ZIP File URL:', zip_file_url)

        # Save form data (you can save to database here)
        print('Job Title:', job_title)
        print('Job Description:', job_description)
        print('Required Skills:', required_skills)
        print('Work Experience:', work_experience)
        # print('ZIP File URL:', zip_file_url)

        return JsonResponse({'status': 'success', 'message': 'Form submitted successfully'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def list_templates(request):
    templates_dir = os.path.join(settings.BASE_DIR,'media','latex_templates')
    templates = [f for f in os.listdir(templates_dir) if f.endswith('.txt')]
    return JsonResponse(templates, safe=False)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_template_content(request, template_name):

    templates_dir = os.path.join(settings.BASE_DIR,'media','latex_templates')
    file_path = os.path.join(templates_dir, template_name)

    if not os.path.exists(file_path):
        log_error("Template does not exist(get_template_content):", "Latext template not found")
        raise Http404("Template does not exist:",file_path)

    with open(file_path, 'r') as file:
        content = file.read()

    return HttpResponse(content, content_type="text/plain")



@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_userdata(request, section_name):

    if request.user.is_enterprise==True:
        return JsonResponse({'error': 'This Feature is not available for enterprise'}, status=400)
    
    if request.user.active_plan.id==1:
        return JsonResponse({'error': 'Please upgrade your plan to use this feature'}, status=400)
    
    user=request.user
    print(user.id,request.user.active_plan.id)


    if(section_name=="personal"):
        # user_folder=str(user.id)
        try:
            data = PersonalInfo.objects.filter(user=user).values()
        except PersonalInfo.DoesNotExist as e:
            log_error("Personal Info does not exists (get_userdata):", str(e))
            data = []
        if not data:
            data = [{
                "name": "",
                "email": "",
                "address": "",
                "phonenumber": "",
                "emailthumbnail": "",
                "linkedinthumbnail": "",
                "linkedin": "",
                "githubthumbnail": "",
                "github": "",
                "portfoliothumbnail": "",
                "portfolio": "",
                "bio": ""
            }]
            return JsonResponse(list(data), safe=False, status=200)
        
        return JsonResponse(list(data), safe=False, status=200)
    elif(section_name=="experience"):
        # user_folder=str(user.id)

        
        return JsonResponse(list((Experience.objects.filter(user=user).values())), safe=False, status=200)
    elif(section_name=="education"):
        # user_folder=str(user.id)
        
        return JsonResponse(list(Education.objects.filter(user=user).values()), safe=False, status=200)
    elif(section_name=="project"):
        # user_folder=str(user.id)
        data = Project.objects.filter(user=user).values()
        return JsonResponse(list(data), safe=False, status=200)
    elif(section_name=="skill"):
        # user_folder=str(user.id)
        data = Skill.objects.filter(user=user).values()
        return JsonResponse(list(data), safe=False, status=200)
    elif(section_name=="certification"):
        # user_folder=str(user.id)
        data = Certification.objects.filter(user=user).values()
        return JsonResponse(list(data), safe=False, status=200)
    elif(section_name=="publication"):
        # user_folder=str(user.id)
        data = Publications.objects.filter(user=user).values()
        return JsonResponse(list(data), safe=False, status=200)
    elif(section_name=="achievement"):
        # user_folder=str(user.id)
        data = Achievement.objects.filter(user=user).values()
        return JsonResponse(list(data), safe=False, status=200)
    elif(section_name=="all"):
        # user_folder=str(user.id)
        try:
            data = {
                "personal": list(PersonalInfo.objects.filter(user=user).values())[0],
                "experiences":list(Experience.objects.filter(user=user).values()),
                "education":list(Education.objects.filter(user=user).values()),
                "projects": list(Project.objects.filter(user=user).values()),
                "skills": list(Skill.objects.filter(user=user).values()),
                "certifications": list(Certification.objects.filter(user=user).values()),
                "publications": list(Publications.objects.filter(user=user).values()),
                "achievements": list(Achievement.objects.filter(user=user).values()),
            }
            
            print(data)
            del data["personal"]["id"]
            del data["personal"]["user_id"]
            return JsonResponse(data, safe=False, status=200)
        except Exception as e:
            print(f'Error fetching all data: {e}')
            log_error("Error fetching all data (get_userdata):", str(e))
            return JsonResponse({'error': 'Error fetching all data'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def set_userdata(request, section_name):
    if request.user.is_enterprise==True:
        return JsonResponse({'error': 'This Feature is not available for enterprise'}, status=400)
    
    if request.user.active_plan_id==1:
        return JsonResponse({'error': 'Please upgrade your plan to use this feature'}, status=400)
    
    if(section_name=="personal"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        try:
            PersonalInfo.objects.update_or_create(
                user=user,
                defaults={
                    "name": data.get("name"),
                    "email": data.get("email"),
                    "address": data.get("address"),
                    "phonenumber": data.get("phonenumber"),
                    "emailthumbnail": data.get("email"),
                    "linkedinthumbnail": data.get("linkedinthumbnail"),
                    "linkedin": data.get("linkedin"),
                    "githubthumbnail": data.get("githubthumbnail"),
                    "github": data.get("github"),
                    "portfoliothumbnail": data.get("portfoliothumbnail"),
                    "portfolio": data.get("portfolio"),
                    "bio": data.get("bio"),
                }
            )
        except Exception as e:
            log_error("Error saving personal info (set_userdata):", str(e))
            print(f'Error saving personal info: {e}')
            return JsonResponse({'error': f'Error saving personal info {e}'}, status=400)
        return JsonResponse({'info': 'Personal Info saved.'}, status=200)
    elif(section_name=="experience"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        if(data.get("id")):
            obj=Experience.objects.filter(id=data.get("id"),user=user).update(
                user=user,
                role=data.get("role"),
                company=data.get("company"),
                location=data.get("location"),
                from_date=data.get("from_date"),
                to_date=data.get("to_date"),
                currentlyWorking = data.get("currentlyWorking") if data.get("currentlyWorking") else False,
                details=data.get("details")
            )
            
            return JsonResponse({'info': 'Experience Edited.','id':data.get("id")}, status=200)
        else:
            obj=Experience.objects.create(
                user=user,
                role=data.get("role"),
                company=data.get("company"),
                location=data.get("location"),
                from_date=data.get("from_date"),
                to_date=data.get("to_date"),
                currentlyWorking = data.get("currentlyWorking") if data.get("currentlyWorking") else False,
                details=data.get("details"),
            )
            print(obj.id)
        return JsonResponse({'info': 'Experience saved.','id':obj.id}, status=200)
    elif(section_name=="education"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        if(data.get("id")):
            obj=Education.objects.filter(id=data.get("id"),user=user).update(
                institution=data.get("institution"),
                degree=data.get("degree"),
                fieldOfStudy=data.get("fieldOfStudy"),
                from_date=data.get("from_date"),
                to_date=data.get("to_date"),
                currentlyStuding = data.get("currentlyStuding") if data.get("currentlyStuding") else False,
                score=data.get("score"),
                scoreType=data.get("scoreType"),
                coursework=data.get("coursework")
            )
            return JsonResponse({'info': 'Education Edited.','id':data.get("id")}, status=200)
        else:
            obj=Education.objects.create(
                user=user,
                institution=data.get("institution"),
                degree=data.get("degree"),
                fieldOfStudy=data.get("fieldOfStudy"),
                from_date=data.get("from_date"),
                to_date=data.get("to_date"),
                currentlyStuding = data.get("currentlyStuding") if data.get("currentlyStuding") else False,
                score=data.get("score"),
                scoreType=data.get("scoreType"),
                coursework=data.get("coursework")
            )
            print(obj.id)
        return JsonResponse({'info': 'Education saved.','id':obj.id}, status=200)
    elif(section_name=="project"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        if(data.get("id")):
            obj=Project.objects.filter(id=data.get("id"),user=user).update(
                title=data.get("title"),
                technologies=data.get("technologies"),
                projectLink=data.get("projectLink"),
                from_date=data.get("from_date"),
                details=data.get("details"),
                to_date=data.get("to_date")
            )
            return JsonResponse({'info': 'Project Edited.','id':data.get("id")}, status=200)
        else:
            obj=Project.objects.create(
                user=user,
                title=data.get("title"),
                technologies=data.get("technologies"),
                projectLink=data.get("projectLink"),
                from_date=data.get("from_date"),
                details=data.get("details"),
                to_date=data.get("to_date")
            )
            print(obj.id)
        
            return JsonResponse({'info': 'Projects saved.','id':obj.id}, status=200)
    elif(section_name=="skill"):
        user=request.user
        # user_folder=str(user.id)
        
        data = request.data
        try:
            obj=Skill.objects.create(
                user=user,
                category=request.data.get("category"),
                skill_name=request.data.get("skill_name")
            )
            return JsonResponse({'info': 'Skills saved.','id':obj.id}, status=200)
        except Exception as e:
            print(e,"**")       
            log_error("Error saving skills (set_userdata):", str(e))
            return JsonResponse({'error': "duplicate entry"}, status=500) 

        
        # for category in request.data.keys():
        #     Skill.objects.filter(user=user,category=category).delete()
        #     for skill in request.data.get(category):
        #         try:
        #             Skill.objects.create(
        #                 user=user,
        #                 category=category,
        #                 skill_name=skill
        #             )
        #         except e:
        #             print(e)
        # return JsonResponse({'info': 'Skills saved.'}, status=200)
    
    elif(section_name=="certification"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        if(data.get("id")):
            obj=Certification.objects.filter(id=data.get("id"),user=user).update(
                name=data.get("name"),
                link=data.get("link"),
                authority=data.get("authority"),
                issue_date=data.get("issue_date",""),
                expiry_date=data.get("expiry_date",""),
                credential_id=data.get("credential_id"),
            )
            return JsonResponse({'info': 'Certification Edited.','id':data.get("id")}, status=200)
        else:
            obj=Certification.objects.create(
                user=user,
                name=data.get("name"),
                link=data.get("link"),
                authority=data.get("authority"),
                issue_date=data.get("issue_date",""),
                expiry_date=data.get("expiry_date",""),
                credential_id=data.get("credential_id"),
            )
            print(obj.id)
            return JsonResponse({'info': 'Certification saved.','id':obj.id}, status=200)
        
    elif(section_name=="publication"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        if(data.get("id")):
            obj=Publications.objects.filter(id=data.get("id"),user=user).update(
                title=data.get("title"),
                journel=data.get("journel"),
                publish_date=data.get("publish_date",""),
                link=data.get("link"),
                description=data.get("description")
            )
            return JsonResponse({'info': 'Publication Edited.','id':data.get("id")}, status=200)
        else:
            obj=Publications.objects.create(
                user=user,
                title=data.get("title"),
                journel=data.get("journel"),
                publish_date=data.get("publish_date"),
                link=data.get("link"),
                description=data.get("description")
            )
            print(obj.id)
            return JsonResponse({'info': 'Publication saved.','id':obj.id}, status=200)
        
    elif(section_name=="achievement"):
        user=request.user
        # user_folder=str(user.id)
        data = request.data
        if(data.get("id")):
            obj=Achievement.objects.filter(id=data.get("id"),user=user).update(
                title=data.get("title"),
                link=data.get("link"),
                description=data.get("description"),
                date=data.get("date")
            )
            return JsonResponse({'info': 'Achievement Edited.','id':data.get("id")}, status=200)
        else:
            obj=Achievement.objects.create(
                user=user,
                title=data.get("title"),
                link=data.get("link"),
                description=data.get("description"),
                date=data.get("date")
            )
            print(obj.id)
            return JsonResponse({'info': 'Achievement saved.','id':obj.id}, status=200)
        
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def del_userdata(request,section_name):

    if request.user.is_enterprise==True:
        return JsonResponse({'error': 'This Feature is not available for enterprise'}, status=400)
    
    if request.user.active_plan_id==1:
        return JsonResponse({'error': 'Please upgrade your plan to use this feature'}, status=400)
    
    user=request.user
    id=request.data.get('id')
    if(section_name=="education"):
        Education.objects.filter(id=id,user=user).delete()
        # Education.objects.filter(user=user).delete()
        return JsonResponse({'info': 'Education deleted.'}, status=200)
    elif(section_name=="experience"):
        Experience.objects.filter(id=id,user=user).delete()
        return JsonResponse({'info': 'Experience deleted.',"id":id}, status=200)
    elif(section_name=="project"):
        Project.objects.filter(id=id,user=user).delete()
        return JsonResponse({'info': 'Project deleted.',"id":id}, status=200)
    elif(section_name=="skill"):
        Skill.objects.filter(id=id,user=user).delete()
        return JsonResponse({'info': 'Skill deleted.',"id":id}, status=200)
    elif(section_name=="skilltype"):
        Skill.objects.filter(category=id,user=user).delete()
        return JsonResponse({'info': 'Skill type deleted.',"id":id}, status=200)
    elif(section_name=="certification"):
        Certification.objects.filter(id=id,user=user).delete()
        return JsonResponse({'info': 'Certification deleted.',"id":id}, status=200)
    elif(section_name=="publication"):
        Publications.objects.filter(id=id,user=user).delete()
        return JsonResponse({'info': 'Publication deleted.',"id":id}, status=200)
    elif(section_name=="achievement"):
        Achievement.objects.filter(id=id,user=user).delete()
        return JsonResponse({'info': 'Achievement deleted.',"id":id}, status=200)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_resume_with_ollama(request):
    # Parse the job description (JD) and user ID from the request
    data = json.loads(request.body)
    job_description = data.get("job_description", "").lower()
    useUserData=data.get("useUserData",True)
    user=request.user
    print(user.active_plan.id)

    if request.user.is_enterprise==True:
        return JsonResponse({'error': 'This Feature is not available for enterprise'}, status=400)

    if(user.active_plan.id!=3):
        return JsonResponse({"error": "Your current plan is not allowed to use this feature"}, status=400)

    if not job_description:
        return JsonResponse({"error": "Job description is required"}, status=400)
    
    if useUserData==False:
        
        ollama_payload = {
            "instruction":"generate same kind of json create resume from given job description and don't change the format of data. output should contain ```json so that json could be easily extractable from the response",
            "job_description": job_description,
            "user_data": individual_overall.sample_resume_json,
        }
        response=individual_overall.query_llama3(json.dumps(ollama_payload),3000)
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
        json_str = json_match.group(1)
        data = json.loads(json_str)
        return JsonResponse(data, status=200)

    try:
        # Fetch user data from the database
        # personal_info = PersonalInfo.objects.get(user=user)
        education = list(Education.objects.filter(user=user) or [])
        experience = list(Experience.objects.filter(user=user)or [])
        skills = list(Skill.objects.filter(user=user)or [])
        projects = list(Project.objects.filter(user=user)or [])
        achievements = list(Achievement.objects.filter(user=user)or [])
        publications = list(Publications.objects.filter(user=user)or [])
        certifications = list(Certification.objects.filter(user=user)or [])
        print(education,"\n*",experience,"\n*",skills,"\n*",projects,"\n*",achievements,"\n*",publications,"\n*",certifications)
        # Prepare the user datatosendtothe API
        skilljson={}
        # for skl in skills:
        #     if skl.category not in skilljson:
        #         skilljson[skl.category]=[]
        #     skilljson[skl.category].append(skl.skill_name)

        user_data = {
            "education": [{"id":edu.id,"degree": edu.degree,"fieldOfStudy":edu.fieldOfStudy} for edu in education],
            "experiences": [{"id":exp.id,"role": exp.role,"company":exp.company,"details":exp.details} for exp in experience],
            "projects": [{"id":proj.id,"title": proj.title,"technologies":proj.technologies,"details":proj.details} for proj in projects],
            "skills": [{"id": skl.id,"skill_name":skl.skill_name} for skl in skills],
            "achievements": [{"id":ach.id,"title":ach.title} for ach in achievements],
            "publications": [
                {"id":pub.id,"title": pub.title} for pub in publications
            ],
            "certifications": [
                {"id":cert.id,"title": cert.name}
                for cert in certifications
            ],
        }

        # Send job description and user datatoOllama API
        ollama_payload = {
            "instruction":"generate same kind of json by choosing relavent and most suitable data of user using id to create resume from job description. only select from given data which is most suitable(at lease two projects,two experiences(current one is neccesary), 1 education(May not be relavant),atleast 10 skills, atleast 2 achivements(may not be relavent), publications and atleast 2 certification(May not be relevant)) for job don't generate extra and don't change the format of data. output should contain ```json so that json could be easily extractable from the response",
            "job_description": job_description,
            "user_data": user_data,
        }
        
        response=individual_overall.query_llama3(json.dumps(ollama_payload),3000)

        # Parse the tailored resume from Ollama API response
        print(response,type(response))
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
        print("*"*20)
        json_str = json_match.group(1)
        data = json.loads(json_str)
        print(data)
        print("Now see the error")
        personalInfo=list(PersonalInfo.objects.filter(user=user).values())
        finaldata = {
            "personal":  personalInfo[0] if len(personalInfo)>0 else {
                "name": "",
                "email": "",
                "address": "",
                "phonenumber": "",
                "emailthumbnail": "",
                "linkedinthumbnail": "",
                "linkedin": "",
                "githubthumbnail": "",
                "github": "",
                "portfoliothumbnail": "",
                "portfolio": "",
                "bio": ""
            },
            "experiences":[Experience.objects.filter(id=ele["id"]).values()[0] for ele in data.get("experiences",[]) if type(ele)==dict and Experience.objects.filter(id=ele["id"]).values().exists()],
            "education":[Education.objects.filter(id=ele["id"]).values()[0] for ele in data.get("education",[]) if type(ele)==dict and Education.objects.filter(id=ele["id"]).values().exists()],
            "projects": [Project.objects.filter(id=ele["id"]).values()[0] for ele in data.get("projects",[]) if type(ele)==dict and Project.objects.filter(id=ele["id"]).values().exists()],
            "skills": [Skill.objects.filter(id=ele["id"]).values()[0] for ele in data.get("skills",[]) if type(ele)==dict and Skill.objects.filter(id=ele["id"]).values().exists()],
            "certifications": [Certification.objects.filter(id=ele["id"]).values()[0] for ele in data.get("certifications",[]) if type(ele)==dict and Certification.objects.filter(id=ele["id"]).values().exists()],
            "publications": [Publications.objects.filter(id=ele["id"]).values()[0] for ele in data.get("publications",[]) if type(ele)==dict and Publications.objects.filter(id=ele["id"]).values().exists()],
            "achievements": [Achievement.objects.filter(id=ele["id"]).values()[0] for ele in data.get("achievements",[]) if type(ele)==dict and Achievement.objects.filter(id=ele["id"]).values().exists()],
        }
        
        
        # del data["personal"]["id"]
        # del data["personal"]["user_id"]
        print(finaldata)
        
        return JsonResponse(finaldata, status=200)

    except PersonalInfo.DoesNotExist as e:
        log_error("user not found (generate_resume_with_ollama):", str(e))
        return JsonResponse({"error": "User not found"}, status=404)
    
    except Exception as e:
        print(f'Error generating resume: {e}')
        log_error("Error generating resume (generate_resume_with_ollama):", str(e))
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_resume_ext(request):
    # Parse the job description (JD) and user ID from the request
    data = json.loads(request.body)
    job_description = data.get("job_description", "").lower()
    useUserData=data.get("useUserData",True)
    user=request.user
    print(user.active_plan.id)

    if request.user.is_enterprise==True:
        return JsonResponse({'error': 'This Feature is not available for enterprise'}, status=400)

    if(user.active_plan.id!=3):
        return JsonResponse({"error": "Your current plan is not allowed to use this feature"}, status=400)

    if not job_description:
        return JsonResponse({"error": "Job description is required"}, status=400)
    
    if useUserData==False:
        
        ollama_payload = {
            "instruction":"generate same kind of json create resume from given job description and don't change the format of data. output should contain ```json so that json could be easily extractable from the response",
            "job_description": job_description,
            "user_data": individual_overall.sample_resume_json,
        }
        response=individual_overall.query_llama3(json.dumps(ollama_payload),3000)
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
        json_str = json_match.group(1)
        data = json.loads(json_str)
        return JsonResponse(data, status=200)
    
    sample_resume_json=getDatafromAI(user, job_description)
    for k,v in sample_resume_json["personal"].items():
        sample_resume_json[k]=v
    del sample_resume_json["personal"]
    sample_resume_json["margin"]={"vertical": "1", "horizontal": "1"}
    print("_"*10)
    user_folder=str(user.id)
    user_profile, created = CustomUser.objects.get_or_create(email=request.user)

    latex_code=eval(f"sb2(sample_resume_json,user_profile)")
    # print(latex_code)


    # Ensure the directory exists
    random_num=str(time.time()+ random.randint(1,10))
    output_dir = f"media/temp_latex/{user_folder}"
    remove_directory(output_dir) 
    # remove_directory(f'media/temp_latex/{user_folder}')
    os.makedirs(output_dir, exist_ok=True)

    # Create a temporary LaTeX file
    with open(f'media/temp_latex/{user_folder}/temp{random_num}.tex', 'w') as f:
        f.write(latex_code)


    abs_path = os.path.join(settings.BASE_DIR, f'media/temp_latex/{user_folder}/temp{random_num}.tex')
    print(type(abs_path),abs_path,type(random_num),random_num,type(user_folder),user_folder,type(output_dir),output_dir)
    latex_host=os.getenv('LATEX_SERVICE_URL','http://latex:8081')
    print(latex_host)
    print(latex_host.split('/'))
    if latex_host.split('/')[2].startswith("localhost") or latex_host.split('/')[2].startswith("127.0.0.1"):
        # Compile the LaTeX code using pdflatex
        try:
            log_path = os.path.join(output_dir, 'output.log')
            with open(log_path, 'w') as log_file:
                subprocess.run(
                    ['pdflatex', '-interaction=nonstopmode', '-output-directory', output_dir, abs_path],
                    check=True,
                    stdout=log_file,
                    stderr=log_file
                )
        except subprocess.CalledProcessError as e:
            log_error("Error saving user data CompileLatexView :", str(e))
            pdf_url = f'media/temp_latex/{user_folder}/temp{random_num}.pdf'
            return JsonResponse({'pdf_url': f"https://{request.get_host()}/reserish/"+pdf_url})
            # return Response({'error': 'Compilation failed'}, status=status.HTTP_400_BAD_REQUEST)
    else:    
        response = requests.post(f"{latex_host}/compile/", json={"output_dir":output_dir,"abs_path":abs_path,"user_folder":user_folder,"random_num":random_num})
    
    # Return the compiled PDF
    pdf_url = f'media/temp_latex/{user_folder}/temp{random_num}.pdf'
    return JsonResponse({'pdf_url': f"https://{request.get_host()}/reserish/"+pdf_url})



def getDatafromAI(user, job_description):
    try:
        # Fetch user data from the database
        # personal_info = PersonalInfo.objects.get(user=user)
        education = list(Education.objects.filter(user=user) or [])
        experience = list(Experience.objects.filter(user=user)or [])
        skills = list(Skill.objects.filter(user=user)or [])
        projects = list(Project.objects.filter(user=user)or [])
        achievements = list(Achievement.objects.filter(user=user)or [])
        publications = list(Publications.objects.filter(user=user)or [])
        certifications = list(Certification.objects.filter(user=user)or [])
        print(education,"\n*",experience,"\n*",skills,"\n*",projects,"\n*",achievements,"\n*",publications,"\n*",certifications)
        # Prepare the user datatosendtothe API
        skilljson={}
        # for skl in skills:
        #     if skl.category not in skilljson:
        #         skilljson[skl.category]=[]
        #     skilljson[skl.category].append(skl.skill_name)

        user_data = {
            "education": [{"id":edu.id,"degree": edu.degree,"fieldOfStudy":edu.fieldOfStudy} for edu in education],
            "experiences": [{"id":exp.id,"role": exp.role,"company":exp.company,"details":exp.details} for exp in experience],
            "projects": [{"id":proj.id,"title": proj.title,"technologies":proj.technologies,"details":proj.details} for proj in projects],
            "skills": [{"id": skl.id,"skill_name":skl.skill_name} for skl in skills],
            "achievements": [{"id":ach.id,"title":ach.title} for ach in achievements],
            "publications": [
                {"id":pub.id,"title": pub.title} for pub in publications
            ],
            "certifications": [
                {"id":cert.id,"title": cert.name}
                for cert in certifications
            ],
        }

        # Send job description and user datatoOllama API
        ollama_payload = {
            "instruction":"generate same kind of json by choosing relavent and most suitable data of user using id to create resume from job description. only select from given data which is most suitable(at lease two projects,two experiences(current one is neccesary), 1 education(May not be relavant),atleast 10 skills, atleast 2 achivements(may not be relavent), publications and atleast 2 certification(May not be relevant)) for job don't generate extra and don't change the format of data. output should contain ```json so that json could be easily extractable from the response",
            "job_description": job_description,
            "user_data": user_data,
        }
        
        response=individual_overall.query_llama3(json.dumps(ollama_payload),3000)

        # Parse the tailored resume from Ollama API response
        print(response,type(response))
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
        print("*"*20)
        json_str = json_match.group(1)
        data = json.loads(json_str)
        print(data)
        print("Now see the error")
        personalInfo=list(PersonalInfo.objects.filter(user=user).values())
        finaldata = {
            "personal":  personalInfo[0] if len(personalInfo)>0 else {
                "name": "",
                "email": "",
                "address": "",
                "phonenumber": "",
                "emailthumbnail": "",
                "linkedinthumbnail": "",
                "linkedin": "",
                "githubthumbnail": "",
                "github": "",
                "portfoliothumbnail": "",
                "portfolio": "",
                "bio": ""
            },
            "experiences":[Experience.objects.filter(id=ele["id"]).values()[0] for ele in data.get("experiences",[]) if type(ele)==dict and Experience.objects.filter(id=ele["id"]).values().exists()],
            "education":[Education.objects.filter(id=ele["id"]).values()[0] for ele in data.get("education",[]) if type(ele)==dict and Education.objects.filter(id=ele["id"]).values().exists()],
            "projects": [Project.objects.filter(id=ele["id"]).values()[0] for ele in data.get("projects",[]) if type(ele)==dict and Project.objects.filter(id=ele["id"]).values().exists()],
            "certifications": [Certification.objects.filter(id=ele["id"]).values()[0] for ele in data.get("certifications",[]) if type(ele)==dict and Certification.objects.filter(id=ele["id"]).values().exists()],
            "publications": [Publications.objects.filter(id=ele["id"]).values()[0] for ele in data.get("publications",[]) if type(ele)==dict and Publications.objects.filter(id=ele["id"]).values().exists()],
            "achievements": [Achievement.objects.filter(id=ele["id"]).values()[0] for ele in data.get("achievements",[]) if type(ele)==dict and Achievement.objects.filter(id=ele["id"]).values().exists()],
        }
        finaldata["skills"]={}
        for i in [Skill.objects.filter(id=ele["id"]).values()[0] for ele in data.get("skills",[]) if type(ele)==dict and Skill.objects.filter(id=ele["id"]).values().exists()]:
            if finaldata["skills"].get(i["category"]):
                finaldata["skills"][i["category"]].append(i["skill_name"])
            else:
                finaldata["skills"][i["category"]]=[i["skill_name"]]
        print(finaldata,"**************************************** this")
        
        
        # del data["personal"]["id"]
        # del data["personal"]["user_id"]
        print(finaldata)
        
        return finaldata

    except PersonalInfo.DoesNotExist as e:
        log_error("user not found (generate_resume_with_ollama):", str(e))
        return {"error": "User not found"}
    
    except Exception as e:
        print(f'Error generating resume: {e}')
        log_error("Error generating resume (generate_resume_with_ollama):", str(e))
        return {"error": str(e)}


@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class PaymentOrderView(APIView):
    def post(self, request):
        requested_plan=None
        active_plan=None
        try:
            requested_plan = Plan.objects.get(pk=request.data.get('planid'))
        except Plan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=404)

        try:
            active_plan = request.user.active_plan
        except CustomUser.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=404)

        if active_plan and requested_plan.level <= active_plan.level:
            return Response({'error': 'Please select a higher plan'}, status=400)
        
        user=request.user
        user_folder=str(user.id)
        # Extract form data
        discount=request.data.get('discount', "price_month")
        amount = int(eval(f"requested_plan.{discount}")*100)
        currency = request.data.get('currency', 'INR')
        receipt = "Reserish"
        notes = request.data.get('notes', {})
        # notes["user_id"]= user.id

        print(user,amount, currency, receipt, notes)
        print(settings.RAZORPAY_API_KEY, settings.RAZORPAY_API_SECRET)
        print("********")
        # Create a Razorpay order
        
        # data = {
        #     "amount": amount,
        #     "currency": currency,
        #     "receipt": receipt,
        #     "notes": notes
        # }
        DATA = {
            "amount": amount,
            "currency": "INR",
            "receipt": receipt,
            "notes": notes
        }
        order = client.order.create(data=DATA)

        return JsonResponse(order, status=200)
    
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class PaymentSuccessView(APIView):
    def post(self, request):
        user=request.user
        user_folder=str(user.id)
        print(user,request.data)
        # Extract form data
        orderCreationId = request.data.get('orderCreationId') or request.data.get('razorpay_order_id')
        razorpayOrderId = request.data.get('razorpayOrderId') 
        razorpayPaymentId = request.data.get('razorpayPaymentId') or request.data.get('razorpay_payment_id')
        razorpaySignature = request.data.get('razorpaySignature') or request.data.get('razorpay_signature')
        print(razorpayOrderId, razorpayPaymentId, razorpaySignature)
        # Creating our own digest
        # The format should be like this:
        # digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        # secret
        secret = settings.RAZORPAY_API_SECRET

        # Concatenating orderCreationId and razorpayPaymentId
        payload = orderCreationId + "|" + razorpayPaymentId
        # Creating the digest
        digest = hmac.new(secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        print("********")
        
        print("********")
        print(orderCreationId)
        print(secret)
        print(payload)
        print(digest)
        order = client.order.fetch(razorpayOrderId)
        print(order)
        # Checking if the digest generated is equal to the one sent by Razorpay
        if digest == razorpaySignature:
            try:

                amount_req=float(eval(f"Plan.objects.get(pk=order['notes']['id']).{order['notes']['discount']}"))*100
                amount_rec=float(order['amount_paid'])
                print(amount_req,amount_rec)
                if amount_req>amount_rec:
                    transaction = Transaction.objects.create(
                        user=request.user,
                        plan_id=order['notes']['id'],
                        amount=amount_rec/100,
                        payment_id=razorpayPaymentId,
                        order_id=razorpayOrderId,
                        signature=razorpaySignature,
                        status='incomplete'
                    )
                    return Response({'success': False, 'error': 'Invalid amount'}, status=400)

                transaction = Transaction.objects.create(
                    user=request.user,
                    plan_id=order['notes']['id'],
                    amount=amount_rec/100,
                    payment_id=razorpayPaymentId,
                    order_id=razorpayOrderId,
                    signature=razorpaySignature,
                    status='success'
                )
                user_profile, created = CustomUser.objects.get_or_create(email=request.user)
                user_profile.active_plan = transaction.plan
                mp={"price_month":1,"price_qyear":3,"price_hyear":6,"price_year":12}
                user_profile.plan_duration=mp[order['notes']['discount']]
                user_profile.plan_activated_on=datetime.now()
                user_profile.plan_expiry_date= timezone.now() + relativedelta(months=+mp[order['notes']['discount']])
                user_profile.save()

                # user_profile, created = CustomUser.objects.get_or_create(email=request.user)
                # user_profile.profile_picture = f'profiles/{user_folder}/{filename}'
                # user_profile.save()
                # Update user's plan
                if user_profile.is_enterprise==True:
                    sendNotification(user_profile.email, title="Congratulations", body="We have successfully recieved your payment and your plan is now upgraded",workflow_id="onboarding-demo-workflow-enp")
                else:
                    sendNotification(user_profile.email, title="Congratulations", body="We have successfully recieved your payment and your plan is now upgraded")
                

                return Response({'success': True, 'transaction_id': transaction.id,'msg':'Payment is successful'}, status=200)

            except razorpay.errors.SignatureVerificationError as e:
                
                Transaction.objects.create(
                    user=request.user,
                    plan_id=order['notes']["id"],
                    amount=eval(f"Plan.objects.get(pk=order['notes']['id']).{order['notes']['discount']}"),
                    payment_id=razorpayPaymentId,
                    order_id=razorpayOrderId,
                    signature=razorpaySignature,
                    status='failed',
                    notes=f'Signature verification failed: {str(e)}'
                )
                log_error("Signature verification (PaymentSuccessView):", str(e))
                return Response({'success': False, 'error': 'Invalid signature'}, status=400)
        
            except Exception as e:
                Transaction.objects.create(
                    user=request.user,
                    plan_id=order['notes']["id"],
                    amount=eval(f"Plan.objects.get(pk=order['notes']['id']).{order['notes']['discount']}"),
                    payment_id=razorpayPaymentId,
                    order_id=razorpayOrderId,
                    signature=razorpaySignature,
                    status='failed',
                    notes=f'Error: {str(e)}'
                )
                log_error("Ex (PaymentSuccessView):", str(e))
                return Response({'success': False, 'error': str(e)}, status=500)
            # print("Payment is successful")
            # return JsonResponse({'msg':'Payment is successful'}, status=200)
        else:
            print("Payment is not successful")
            Transaction.objects.create(
                    user=request.user,
                    plan_id=order['notes']["id"],
                    amount=eval(f"Plan.objects.get(pk=order['notes']['id']).{order['notes']['discount']}"),
                    payment_id=razorpayPaymentId,
                    order_id=razorpayOrderId,
                    signature=razorpaySignature,
                    status='failed',
                    notes=f"Error: digest din't match"
                )
            return JsonResponse({'msg': 'Payment failed'}, status=400)
        
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    page_number = request.GET.get('page', 1)
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
    
    paginator = Paginator(transactions, 10)  # Show 10 per page
    page_obj = paginator.get_page(page_number)
    
    serializer = TransactionSerializer(page_obj, many=True)
    
    return Response({
        'results': serializer.data,
        'total_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'count': paginator.count
    })
    # transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
    # return Response(TransactionSerializer(transactions, many=True).data)

def parse_date(date_str):
    if date_str:
        formats = [
            "%Y-%m-%dT%H:%M:%S.%fZ",
            "%Y-%m-%d",
            "%d %B %Y",  # e.g., "01 January 2024"
            "%b %Y",   # e.g., "Jan 2024"
            "%B %Y",   # e.g., "January 2024"
            "%m/%Y",   # e.g., "01/2024"
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                print(f"Error parsing date: {date_str}",fmt)

        return None  # Return None if date format is invalid
    return None

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def storeData(data,usr):
    # Create or get user
    # , "first_name": data.get("name")

    # user, created = CustomUser.objects.get_or_create(
    #     email=data.get("email"),
    #     defaults={"email": data.get("email").split('@')[0]}
    # )
    print("*****************************************************",usr)
    # email = data.get("email")
    # print(email)
    user = CustomUser.objects.get(email=usr.email)
    print(user)
    
    print("**",PersonalInfo.objects.filter(user=user))
    print("***",PersonalInfo.objects.filter(user=user).count())
    print(data)
    # print(PersonalInfo.objects.get(user=user))
    #check if field values not present then only update
    if PersonalInfo.objects.filter(user=user).count()==0:
        print("pif")
        # Update or create personal info

        try:
            PersonalInfo.objects.update_or_create(
                user=user,
                defaults={
                    'name': data.get("name"),
                    'email': data.get("email"),
                    'emailthumbnail': data.get("email"),
                    'phonenumber': data.get("phonenumber"),
                    'linkedinthumbnail': data.get("linkedinthumbnail"),
                    'linkedin': data.get("linkedin"),
                    'githubthumbnail': data.get("githubthumbnail"),
                    'github': data.get("github"),
                    'portfoliothumbnail': data.get("portfoliothumbnail"),
                    'portfolio': data.get("portfolio"),
                    'bio': data.get("bio"),
                }
            )
        except Exception as e:
            print(f'Error saving personal info: {e}')
            log_error("Error saving personal info (storedata):", str(e))
            return JsonResponse({'error': f'Error saving personal info {e}'}, status=400)
    else:
        personal_data=PersonalInfo.objects.get(user=user)
        print(personal_data)
        if personal_data.name=="":
            personal_data.name=data.get("name")
        if personal_data.email=="":
            personal_data.email=data.get("email")
        if personal_data.address=="":
            personal_data.address=data.get("address")
        if personal_data.phonenumber=="":
            personal_data.phonenumber=data.get("phonenumber")
        if personal_data.linkedinthumbnail=="":
            personal_data.linkedinthumbnail=data.get("linkedinthumbnail")
        if personal_data.linkedin=="":
            personal_data.linkedin=data.get("linkedin")
        if personal_data.githubthumbnail=="":
            personal_data.githubthumbnail=data.get("githubthumbnail")
        if personal_data.github=="":
            personal_data.github=data.get("github")
        if personal_data.portfoliothumbnail=="":
            personal_data.portfoliothumbnail=data.get("portfoliothumbnail")
        if personal_data.portfolio=="":
            personal_data.portfolio=data.get("portfolio")
        if personal_data.bio=="":
            personal_data.bio=data.get("summary")
        personal_data.save()

    # Save skills
    # Skill.objects.filter(user=user).delete() 
    ske=0 
    for category, skills in data.get("skills", {}).items():
        
        for skill in skills:
            try:
                Skill.objects.create(user=user, category=category, skill_name=skill)
            except Exception as e:
                print(f"Error saving skill: {e}")
                ske+=1
    if ske>0:
        log_error("storing skills (storedata):", str(ske)+" skills not saved for user "+str(user.id))
            # Skill.objects.create(user=user, category=category, skill_name=skill)

    # Save experiences
    # Experience.objects.filter(user=user).delete()
    for experience in data.get("experiences", []):
        try:
            if Experience.objects.filter(user=user,role=experience.get("role"), company=experience.get("company")).exists():
                continue
            print(experience)
            Experience.objects.create(
                user=user,
                role=experience.get("role"),
                company=experience.get("company"),
                location=experience.get("location"),
                from_date=parse_date(experience.get("from_date")),
                to_date=parse_date(experience.get("to_date")) if experience.get("currentlyWorking") != "true" else None,
                currentlyWorking = experience.get("currentlyWorking") if experience.get("currentlyWorking") in [None,""] else False,
                details=experience.get("details") if experience.get("details") else [],
                # skills_used="",
            )
        except Exception as e:
            print(f"Error saving experience: {e}")
            log_error("Exprience (storedata):", str(e))

    # Save education with date parsing
    # Education.objects.filter(user=user).delete()
    # edu_data=Education.objects.filter(user=user).get()
    for edu in data.get("education", []):
        
        try:
            if Education.objects.filter(user=user,degree=edu.get("degree"), fieldOfStudy=edu.get("fieldOfStudy")).exists():
                continue
            Education.objects.create(
                user=user,
                institution=edu.get("institution"),
                degree=edu.get("degree"),
                fieldOfStudy=edu.get("fieldOfStudy"),
                from_date=parse_date(edu.get("from_date")),
                to_date=parse_date(edu.get("to_date")) if edu.get("to_date") else None,
                currentlyStuding=edu.get("currentlyStuding") == "true" if edu.get("currentlyStuding") in [None,""] else False,
                scoreType=edu.get("scoreType"),
                score=edu.get("score"),
                coursework=edu.get("coursework", [])
            )
        except Exception as e:
            print(f"Error saving education: {e}")
            log_error("Education (storedata):", str(e))


    # Save projects with date parsing
    # Project.objects.filter(user=user).delete()
    for project in data.get("projects", []):
        try:
            if Project.objects.filter(user=user,title=project.get("title")).exists():
                continue
            Project.objects.create(
                user=user,
                title=project.get("title"),
                details=data.get("details"),
                technologies=project.get("technologies"),
                projectLink=project.get("projectLink"),
                from_date=parse_date(project.get("from_date","")),
                to_date=parse_date(project.get("to_date")) if project.get("to_date") != "Till Date" else None,
            )
        except Exception as e:
            print(f"Error saving project: {e}")
            log_error("Project (storedata):", str(e))

    # Save certifications with date parsing
    # Certification.objects.filter(user=user).delete()
    for cert in data.get("certifications", []):
        try:
            if Certification.objects.filter(user=user,name=cert.get("name")).exists():
                continue
            Certification.objects.create(
                user=user,
                name=cert.get("name"),
                link=cert.get("link"),
                authority=cert.get("authority"),
                issue_date=parse_date(cert.get("issue_date","")),
                expiry_date=parse_date(cert.get("expiry_date","")),
                credential_id=cert.get("credential_id"),
            )
        except Exception as e:
            print(f"Error saving certification: {e}")
            log_error("Certification (storedata):", str(e))

    # Save publications with date parsing
    # Publications.objects.filter(user=user).delete()
    for pub in data.get("publications", []):
        try:
            if Publications.objects.filter(user=user,title=pub.get("title")).exists():
                continue
            Publications.objects.create(
                user=user,
                title=pub.get("title"),
                journel=pub.get("journel"),
                publish_date=parse_date(pub.get("publish_date")),
                link=pub.get("link"),
                description=pub.get("description")
            )
        except Exception as e:
            print(f"Error saving publication: {e}")
            log_error("Publication (storedata):", str(e))
    
    # Save achievements with date parsing
    # Achievement.objects.filter(user=user).delete()
    for ach in data.get("achievements", []):
        try:
            if Achievement.objects.filter(user=user,title=ach.get("title")).exists():
                continue
            Achievement.objects.create(
                user=user,
                title=ach.get("title"),
                link=ach.get("link"),
                description=ach.get("description"),
                date=parse_date(ach.get("date")),
            )
        except Exception as e:
            print(f"Error saving achievement: {e}")
            log_error("Achievement (storedata):", str(e))
    


    print("Data saved successfully")

@api_view(['POST'])
@permission_classes([AllowAny])
def joblistings(request):
    """Get both local and scraped jobs with filters"""
    try:
        # Get filters from request
        filters = request.data.get('filters', {})
        job_type = filters.get('jobType', '')
        location = filters.get('location', '')
        experience = filters.get('experience', '')
        profession = filters.get('profession', '')
        discipline = filters.get('discipline', '')
        
        # Get local jobs (not scraped)
        local_jobs = Job.objects.filter(status='active', is_scraped=False)
        
        # Apply filters to local jobs
        if job_type:
            local_jobs = local_jobs.filter(job_type__icontains=job_type)
        if location:
            local_jobs = local_jobs.filter(location__icontains=location)
        if experience:
            local_jobs = local_jobs.filter(experience__icontains=experience)
        if profession:
            local_jobs = local_jobs.filter(profession__icontains=profession)
        if discipline:
            local_jobs = local_jobs.filter(discipline__icontains=discipline)
        
        # Get scraped jobs from Job table (where is_scraped=True)
        scraped_jobs = Job.objects.filter(status='active', is_scraped=True)
        
        # Apply filters to scraped jobs
        if job_type:
            scraped_jobs = scraped_jobs.filter(job_type__icontains=job_type)
        if location:
            scraped_jobs = scraped_jobs.filter(location__icontains=location)
        if experience:
            scraped_jobs = scraped_jobs.filter(experience__icontains=experience)
        if profession:
            scraped_jobs = scraped_jobs.filter(profession__icontains=profession)
        if discipline:
            scraped_jobs = scraped_jobs.filter(discipline__icontains=discipline)
        
        # Transform local jobs
        local_jobs_data = []
        for job in local_jobs:
            local_jobs_data.append({
                'id': job.id,
                'title': job.title,
                'company': job.company.email if job.company else 'Unknown',
                'location': job.location or 'Not specified',
                'jobType': job.job_type or 'Full-Time',
                'experience': job.experience or 'Not specified',
                'profession': job.profession or 'Technology',
                'discipline': job.discipline or 'Software Development',
                'description': job.description or '',
                'salary': 'Not specified',
                'source': 'Local',
                'url': '',
                'is_scraped': False,
                'created_at': job.created_at.isoformat() if job.created_at else None
            })
        
        # Transform scraped jobs
        scraped_jobs_data = []
        for job in scraped_jobs:
            scraped_jobs_data.append({
                'id': f"scraped_{job.id}",
                'title': job.title,
                'company': job.scraped_source or 'External Company',  # Use scraped_source instead of company_name
                'location': job.location or 'Not specified',
                'jobType': job.job_type or 'Full-Time',
                'experience': job.experience or 'Not specified',
                'profession': job.profession or 'Technology',
                'discipline': job.discipline or 'Software Development',
                'description': job.description or '',
                'salary': job.scraped_salary or 'Not specified',  # Use scraped_salary
                'source': job.scraped_source or 'External',  # Use scraped_source
                'url': job.scraped_url or '',  # Use scraped_url
                'is_scraped': True,
                'created_at': job.created_at.isoformat() if job.created_at else None  # Use created_at instead of scraped_at
            })
        
        # Combine all jobs
        all_jobs = local_jobs_data + scraped_jobs_data
        
        # Sort by creation date (newest first)
        all_jobs.sort(key=lambda x: x['created_at'] or '', reverse=True)
        
        return JsonResponse({
            'success': True,
            'jobs': all_jobs,
            'total_jobs': len(all_jobs),
            'local_jobs': len(local_jobs_data),
            'scraped_jobs': len(scraped_jobs_data),
            'filters_applied': filters
        })
        
    except Exception as e:
        print(f"Error in joblistings: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Error occurred while fetching jobs: {str(e)}',
            'jobs': [],
            'total_jobs': 0
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def enhanced_job_scraping(request):
    """Enhanced job scraping with filters and salary information"""
    try:
        # Get filters from request
        filters = request.data.get('filters', {})
        max_jobs = request.data.get('max_jobs', 10)
        
        # Import the optimized scraper
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'bkend_function', 'jobs'))
        from optimized_job_scraper import scrape_jobs_with_filters
        
        # Apply filters
        applied_filters = {
            'location': filters.get('location', ''),
            'jobType': filters.get('jobType', ''),
            'experience': filters.get('experience', ''),
            'profession': filters.get('profession', ''),
            'discipline': filters.get('discipline', '')
        }
        
        # Remove empty filters
        applied_filters = {k: v for k, v in applied_filters.items() if v}
        
        # Scrape jobs
        print(f"Scraping jobs with filters: {applied_filters}")
        scraped_jobs = scrape_jobs_with_filters(applied_filters, max_jobs)
        
        if scraped_jobs:
            # Transform scraped jobs to match the expected format
            transformed_jobs = []
            for job in scraped_jobs:
                transformed_job = {
                    'id': job.get('id', f"scraped_{hash(job.get('title', '') + job.get('company', ''))}"),
                    'title': job.get('title', 'N/A'),
                    'company': job.get('company', 'N/A'),
                    'location': job.get('location', 'N/A'),
                    'jobType': job.get('jobType', 'Full-Time'),
                    'experience': job.get('experience', '0-1 Years'),
                    'profession': job.get('profession', 'Technology'),
                    'discipline': job.get('discipline', 'Software Development'),
                    'description': job.get('description', ''),
                    'salary': job.get('salary', 'Not specified'),
                    'source': job.get('source', 'External'),
                    'url': job.get('url', ''),
                    'is_scraped': True
                }
                transformed_jobs.append(transformed_job)
            
            return JsonResponse({
                'success': True,
                'jobs': transformed_jobs,
                'total_jobs': len(transformed_jobs),
                'filters_applied': applied_filters
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'No jobs found with the specified filters',
                'jobs': [],
                'total_jobs': 0
            })
            
    except Exception as e:
        print(f"Error in enhanced job scraping: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Error occurred while scraping jobs: {str(e)}',
            'jobs': [],
            'total_jobs': 0
        }, status=500)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def createJob(request):
    query=request.data
    print(query)
    return JsonResponse({"jobs":"created"}, status=200)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def change_job_status(request):
    jobId=request.data.get("jobId")
    status= 'closed'  #request.data.get("status")
    print(jobId,status)
    if not Job.objects.filter(id=jobId,company=request.user).exists():
        return JsonResponse({"error":"Job not found or you are not authorized to close this job"}, status=404)
    
    Job.objects.filter(id=jobId,company=request.user).update(status=status)
    
    
    return JsonResponse({"message":"Job closed"}, status=200)

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class JobPostingCreateView(generics.CreateAPIView):
    serializer_class = JobPostingSerializer

    # def perform_create(self, serializer):
    #     serializer.save(company=self.request.user)  # Set company as the logged-in user

    def validate_skills(self, value):
        if isinstance(value, list):  # Convert list to string
            return ','.join(value)
        return value
    
    def post(self, request, *args, **kwargs):
        if not request.user.is_enterprise:
            return Response({"error": "This feature is not available for individual users."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.plan_expiry_date < timezone.now():
            return Response({"error": "Your plan has expired."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.active_plan_id == 5:
            return Response({"error": "Your current plan is not allowed to use this feature"}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data["skills"] = self.validate_skills(data.get("skills", []))
        # data["company"]=self.request.user.id
        print(data)

        serializer = JobPostingSerializer(data=data)
        if serializer.is_valid():
            serializer.save(company=request.user)  # Assign company from logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # Return validation errors


@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class JobCreateView(generics.CreateAPIView):
    serializer_class = JobPostingSerializer

    def perform_create(self, serializer):
        print(serializer)
        serializer.save(company=self.request.user)  # Set company

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class JobApplicationCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer 

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            data['status'] = "pending"  # Set default status to pending
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                print("Serializer errors:", serializer.errors)  # 🔍 PRINT ERRORS
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save(applicant=request.user)
            return Response({"message": "Application submitted successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating job application: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # def perform_create(self, serializer):
    #     serializer.save(applicant=self.request.user)
    #     return Response({"message": "Application submitted successfully"}, status=status.HTTP_201_CREATED)

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class JobApplicationListView(APIView):
    def post(self, request):
        try:
            job_id = request.data.get("jobId")
            print("id-> ", job_id)

            if not job_id:
                return Response([], status=200)

            jb = JobApplication.objects.filter(job_id=job_id)
            print("applications-> ", jb)

            serializer = JobApplicationSerializer(jb, many=True)
            return Response(serializer.data, status=200)

        except Exception as e:
            print(f"Error fetching job applications: {e}")
            return Response({"error": str(e)}, status=500)

@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
class JobApplicationUserListView(APIView):
    def post(self, request):
        try:
            user = request.user
            jb = JobApplication.objects.filter(applicant=user)
            print("applications-> ", jb)
            serializer = JobApplicationUserSerializer(jb, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            print(f"Error fetching job applications: {e}")
            return Response({"error": str(e)}, status=500)

class JobApplicationUpdateView(generics.UpdateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobPostingSerializer

    def update(self, request, *args, **kwargs):
        application = self.get_object()
        status = request.data.get("status")

        if status not in ["accepted", "rejected"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        application.status = status
        application.save()
        return Response({"message": f"Application {status} successfully!"})


class MyPostedJobsView(generics.ListAPIView):
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        print(self.request.user)
        jobs=[]
        try:
            jobs = Job.objects.filter(company=self.request.user).annotate(
                total_applicants=Count('applicants')
            )
            # print("**",jobs)
            # for job in jobs:
            #     print(job.title, job.total_applicants)
            return jobs
        except Exception as e:
            print(f"Error fetching jobs: {e}")
            return Job.objects.none()

        


class JobListView(generics.ListAPIView):
    queryset = Job.objects.filter(status="active").order_by("-created_at")  # Show latest jobs first
    serializer_class = JobPostingSerializer
    permission_classes = [AllowAny]  # Anyone can view jobs
# class JobPostingListView(ListAPIView):
#     queryset = JobPosting.objects.all().order_by('-created_at')
#     serializer_class = JobPostingSerializer
#     permission_classes = [AllowAny] 

# @api_view(['POST'])
# def register(request):
#     serializer = RegisterSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         token, _ = Token.objects.get_or_create(user=user)
#         return Response({
#             "user": {
#                 "username": user.username,
#                 "email": user.email,
#                 "is_enterprise": user.is_enterprise
#             },
#             "token": token.key
#         }, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RegisterUserView(generics.CreateAPIView):
#     queryset = CustomUser.objects.all()
#     serializer_class = RegisterSerializer
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         print(request.data,"*****")
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response({'info': 'User created.'}, status=status.HTTP_201_CREATED, headers=headers)
    
# class RegisterEnterpriseView(generics.CreateAPIView):
#     queryset = CustomUser.objects.all()
#     serializer_class = RegisterSerializer
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         print(request.data,"*****")
#         serializer.is_valid(raise_exception=True)
#         print(request.data,"_____")
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response({'info': 'Enterprise created.'}, status=status.HTTP_201_CREATED, headers=headers)

    # class LoginEnterpriseView(APIView):
    # def post(self, request, *args, **kwargs):
        
    #     username = request.data.get('email')
    #     password = request.data.get('password')
    #     print(request.data,"|---",username)

    #     # Ensure username and password are provided
    #     if not username or not password:
    #         return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    #     # Authenticate the user
    #     user = authenticate(email=username, password=password)
    #     print(user,"|-"*1)

    #     if user is not None:
    #         login(request, user)
            
    #         # Create access token
    #         access_token = RefreshToken.for_user(user)
            
    #         # Include both access and refresh tokens in the response
    #         response_data = {
    #             'access_token': str(access_token.access_token),
    #             'refresh_token': str(access_token),
    #         }

    #         return Response(response_data, status=status.HTTP_200_OK)
    #     else:
    #         return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_available_slots(request):
    """Get available interview slots for the next 30 days"""
    try:
        # Get slots for next 30 days
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=30)
        
        slots = InterviewSlot.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
            is_active=True
        ).order_by('date', 'start_time')
        
        # Filter out fully booked slots
        available_slots = []
        for slot in slots:
            if slot.is_available:
                available_slots.append(slot)
        
        serializer = InterviewSlotSerializer(available_slots, many=True)
        return Response({
            'success': True,
            'slots': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_bookings(request):
    """Get all bookings for the current user"""
    try:
        bookings = InterviewBooking.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        serializer = InterviewBookingSerializer(bookings, many=True)
        return Response({
            'success': True,
            'bookings': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def book_interview_slot(request):
    """Book an interview slot for the current user"""
    try:
        slot_id = request.data.get('slot_id')
        notes = request.data.get('notes', '')
        
        if not slot_id:
            return Response({
                'success': False,
                'error': 'Slot ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check monthly interview limit (2 per month)
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        monthly_bookings = InterviewBooking.objects.filter(
            user=request.user,
            slot__date__month=current_month,
            slot__date__year=current_year,
            status='confirmed'
        ).count()
        
        if monthly_bookings >= 2:
            return Response({
                'success': False,
                'error': 'You have reached the monthly limit of 2 interviews. Please try again next month.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if slot exists and is available
        try:
            slot = InterviewSlot.objects.get(id=slot_id, is_active=True)
        except InterviewSlot.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Interview slot not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not slot.is_available:
            return Response({
                'success': False,
                'error': 'This slot is no longer available'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already has a booking for this slot
        if InterviewBooking.objects.filter(user=request.user, slot=slot).exists():
            return Response({
                'success': False,
                'error': 'You already have a booking for this slot'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the booking
        booking = InterviewBooking.objects.create(
            user=request.user,
            slot=slot,
            notes=notes
        )
        
        # Create interview session
        session = InterviewSession.objects.create(
            booking=booking
        )
        
        # Create real Google Calendar event with Google Meet
        print(f"🔍 Debug: ===== GOOGLE CALENDAR CREATION START =====")
        print(f"🔍 Debug: Booking ID: {booking.id}")
        print(f"🔍 Debug: User: {booking.user.email}")
        print(f"🔍 Debug: Slot: {booking.slot.date} {booking.slot.start_time}")
        
        calendar_result = None
        try:
            print(f"🔍 Debug: Calling create_google_calendar_event()...")
            calendar_result = booking.create_google_calendar_event()
            print(f"🔍 Debug: Calendar creation result: {calendar_result}")
            
            if calendar_result and calendar_result.get('success'):
                meet_link = calendar_result.get('meet_link')
                print(f"✅ Google Meet link created: {meet_link}")
                print(f"✅ Meeting ID: {calendar_result.get('meeting_id')}")
                
                # Verify the meeting link is accessible
                if meet_link and meet_link.startswith('https://meet.google.com/'):
                    print(f"✅ Meeting link format is correct: {meet_link}")
                else:
                    print(f"❌ Meeting link format is incorrect: {meet_link}")
                
                # IMPORTANT: Refresh the booking object from database to get updated meeting_link
                print(f"🔍 Debug: Refreshing booking from database...")
                booking.refresh_from_db()
                print(f"🔍 Debug: After refresh - Meeting link: {booking.meeting_link}")
                print(f"🔍 Debug: After refresh - Meeting ID: {booking.meeting_id}")
            else:
                print(f"❌ Failed to create calendar event: {calendar_result}")
                # If Google Meet fails, we should probably not allow the booking
                # since users expect working meeting links
        except Exception as calendar_error:
            print(f"❌ Calendar creation failed: {calendar_error}")
            import traceback
            traceback.print_exc()
            # Continue with booking even if calendar fails
        
        print(f"🔍 Debug: ===== GOOGLE CALENDAR CREATION END =====")
        
        # Send confirmation emails
        try:
            booking.send_confirmation_emails()
        except Exception as email_error:
            print(f"Email sending failed: {email_error}")
            # Continue with booking even if emails fail
        
        print(f"🔍 Debug: ===== SERIALIZER AND RESPONSE =====")
        print(f"🔍 Debug: Final booking state before serializer:")
        print(f"🔍 Debug:   Meeting Link: {booking.meeting_link}")
        print(f"🔍 Debug:   Meeting ID: {booking.meeting_id}")
        
        serializer = InterviewBookingSerializer(booking)
        response_data = {
            'success': True,
            'booking': serializer.data,
            'message': 'Interview slot booked successfully! Check your email for meeting details.'
        }
        
        print(f"🔍 Debug: Response data being sent to frontend:")
        print(f"🔍 Debug: Meeting link: {serializer.data.get('meeting_link')}")
        print(f"🔍 Debug: Meeting ID: {serializer.data.get('meeting_id')}")
        print(f"🔍 Debug: Full booking data: {serializer.data}")
        
        print(f"🔍 Debug: ===== END SERIALIZER AND RESPONSE =====")
        
        return Response(response_data)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_interview_booking(request):
    """Cancel an interview booking"""
    try:
        booking_id = request.data.get('booking_id')
        
        if not booking_id:
            return Response({
                'success': False,
                'error': 'Booking ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            booking = InterviewBooking.objects.get(
                id=booking_id,
                user=request.user,
                status='confirmed'
            )
        except InterviewBooking.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Booking not found or cannot be cancelled'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if booking is within cancellation window (24 hours before)
        slot_datetime = datetime.combine(booking.slot.date, booking.slot.start_time)
        if timezone.now() + timedelta(hours=24) > slot_datetime:
            return Response({
                'success': False,
                'error': 'Cannot cancel booking within 24 hours of interview'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response({
            'success': True,
            'message': 'Interview booking cancelled successfully'
        })
    except Exception as e:
        print(e,"***********8")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_slot_details(request, slot_id):
    """Get detailed information about a specific slot"""
    try:
        slot = InterviewSlot.objects.get(id=slot_id, is_active=True)
        serializer = InterviewSlotSerializer(slot)
        
        # Get booking information if user has one
        user_booking = None
        if InterviewBooking.objects.filter(user=request.user, slot=slot).exists():
            user_booking = InterviewBookingSerializer(
                InterviewBooking.objects.get(user=request.user, slot=slot)
            ).data
        
        return Response({
            'success': True,
            'slot': serializer.data,
            'user_booking': user_booking
        })
    except InterviewSlot.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Interview slot not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_interview_stats(request):
    """Get user's interview statistics and feedback"""
    try:
        user = request.user
        
        # Get all user's bookings
        user_bookings = InterviewBooking.objects.filter(user=user)
        
        # Calculate stats
        total_interviews = user_bookings.count()
        completed_interviews = user_bookings.filter(
            slot__date__lt=timezone.now().date()
        ).count()
        upcoming_interviews = user_bookings.filter(
            slot__date__gte=timezone.now().date()
        ).count()
        
        # Calculate average rating (if you have a rating system)
        # For now, we'll use a placeholder
        average_rating = 4.5  # This should come from actual feedback system
        
        # Count feedback (if you have a feedback system)
        # For now, we'll use a placeholder
        total_feedback = completed_interviews
        
        # Calculate monthly usage
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        monthly_bookings = user_bookings.filter(
            slot__date__month=current_month,
            slot__date__year=current_year,
            status='confirmed'
        ).count()
        
        monthly_limit = 2
        remaining_this_month = max(0, monthly_limit - monthly_bookings)
        
        stats = {
            'totalInterviews': total_interviews,
            'completedInterviews': completed_interviews,
            'upcomingInterviews': upcoming_interviews,
            'averageRating': average_rating,
            'totalFeedback': total_feedback,
            'monthlyBookings': monthly_bookings,
            'monthlyLimit': monthly_limit,
            'remainingThisMonth': remaining_this_month
        }
        
        return Response(stats)
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# FEEDBACK SYSTEM VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_feedback(request):
    """Submit feedback for a feature"""
    try:
        serializer = FeedbackSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            feedback = serializer.save()
            return Response({
                'success': True,
                'message': 'Feedback submitted successfully',
                'feedback_id': feedback.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_feedback_stats(request):
    """Get feedback statistics"""
    try:
        from django.db.models import Avg, Count
        
        # Get overall stats
        total_feedback = Feedback.objects.count()
        average_rating = Feedback.objects.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Get rating distribution
        rating_distribution = Feedback.objects.values('rating').annotate(
            count=Count('rating')
        ).order_by('rating')
        
        # Get feature-wise stats
        feature_stats = Feedback.objects.values('feature_name').annotate(
            count=Count('id'),
            avg_rating=Avg('rating')
        ).order_by('-count')
        
        # Get recent feedback
        recent_feedback = Feedback.objects.select_related('user').order_by('-created_at')[:10]
        recent_serializer = FeedbackSerializer(recent_feedback, many=True)
        
        stats = {
            'total_feedback': total_feedback,
            'average_rating': round(average_rating, 1),
            'rating_distribution': list(rating_distribution),
            'feature_stats': list(feature_stats),
            'recent_feedback': recent_serializer.data
        }
        
        return Response({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def schedule_feedback_reminder(request):
    """Schedule a feedback reminder for later"""
    try:
        feature_name = request.data.get('feature_name')
        reminder_time = request.data.get('reminder_time')
        
        if not feature_name or not reminder_time:
            return Response({
                'success': False,
                'error': 'Feature name and reminder time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create reminder
        reminder_data = {
            'feature_name': feature_name,
            'reminder_time': reminder_time
        }
        
        # Add user if authenticated
        if request.user.is_authenticated:
            reminder_data['user'] = request.user
        
        # Add IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        reminder_data['ip_address'] = ip
        
        serializer = FeedbackReminderSerializer(data=reminder_data)
        if serializer.is_valid():
            reminder = serializer.save()
            return Response({
                'success': True,
                'message': 'Feedback reminder scheduled successfully',
                'reminder_id': reminder.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_feedback_history(request):
    """Get feedback history for authenticated user"""
    try:
        user_feedback = Feedback.objects.filter(user=request.user).order_by('-created_at')
        serializer = FeedbackSerializer(user_feedback, many=True)
        
        return Response({
            'success': True,
            'feedback_history': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_feedback(request, feedback_id):
    """Delete user's own feedback"""
    try:
        feedback = get_object_or_404(Feedback, id=feedback_id, user=request.user)
        feedback.delete()
        
        return Response({
            'success': True,
            'message': 'Feedback deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def start_ai_interview(request):
    """Start an AI interview session and generate initial questions"""
    try:
        from .services.ai_interview_service import ai_interview_service
        
        data = request.data
        job_description = data.get('job_description', '')
        user_resume_summary = data.get('user_resume_summary', '')
        question_count = data.get('question_count', 5)
        difficulty = data.get('difficulty', 'medium')
        
        # Get or create interview session
        user = request.user
        try:
            # Find the most recent confirmed booking (optional for AI interviews)
            latest_booking = InterviewBooking.objects.filter(
                user=user,
                status='confirmed'
            ).order_by('-created_at').first()
            
            # If no booking found, create a virtual session for AI interview
            if not latest_booking:
                # Create a virtual booking for AI interview
                from datetime import datetime, timedelta
                virtual_slot_date = timezone.now().date()
                virtual_start_time = timezone.now().time()
                virtual_end_time = (timezone.now() + timedelta(hours=1)).time()
                
                # Create a virtual slot first
                from .models import InterviewSlot
                virtual_slot = InterviewSlot.objects.create(
                    date=virtual_slot_date,
                    start_time=virtual_start_time,
                    end_time=virtual_end_time,
                    is_active=False,  # Mark as inactive since it's virtual
                    max_bookings=1
                )
                
                # Create a virtual booking
                latest_booking = InterviewBooking.objects.create(
                    user=user,
                    slot=virtual_slot,
                    status='confirmed',
                    notes='AI Interview Practice Session'
                )
            
            # Get or create session
            session, created = InterviewSession.objects.get_or_create(
                booking=latest_booking,
                defaults={
                    'started_at': timezone.now(),
                    'interviewer_name': 'AI Interview Coach'
                }
            )
            
            if not created:
                # Update start time if session already exists
                session.started_at = timezone.now()
                session.save()
            
            # Generate AI questions
            questions = ai_interview_service.generate_interview_questions(
                job_description=job_description,
                user_resume_summary=user_resume_summary,
                question_count=question_count,
                difficulty=difficulty
            )
            
            # Create or update conversation
            conversation, conv_created = InterviewConversation.objects.get_or_create(
                session=session,
                defaults={
                    'job_description': job_description,
                    'user_resume_summary': user_resume_summary,
                    'conversation_data': [],
                    'ai_evaluation': {}
                }
            )
            
            if not conv_created:
                conversation.job_description = job_description
                conversation.user_resume_summary = user_resume_summary
                conversation.save()
            
            return Response({
                'success': True,
                'session_id': session.id,
                'conversation_id': conversation.id,
                'questions': questions,
                'message': 'AI interview session started successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            log_error("start_ai_interview", str(e))
            return Response({
                'success': False,
                'error': f'Failed to start interview: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        log_error("start_ai_interview", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_interview_response(request):
    """Submit user's response to an interview question and get AI evaluation"""
    try:
        from .services.ai_interview_service import ai_interview_service
        
        data = request.data
        conversation_id = data.get('conversation_id')
        question_text = data.get('question_text')
        user_response = data.get('user_response')
        question_data = data.get('question_data', {})
        response_duration = data.get('response_duration', 0)
        
        if not all([conversation_id, question_text, user_response]):
            return Response({
                'success': False,
                'error': 'Missing required fields: conversation_id, question_text, user_response'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            conversation = InterviewConversation.objects.get(id=conversation_id)
            
            # Verify user owns this conversation
            if conversation.session.booking.user != request.user:
                return Response({
                    'success': False,
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get expected answer points from question data
            expected_points = question_data.get('expected_answer_points', [])
            job_context = conversation.job_description
            
            # Evaluate response using AI
            evaluation = ai_interview_service.evaluate_user_response(
                question=question_text,
                user_response=user_response,
                expected_points=expected_points,
                job_context=job_context
            )
            
            # Create or get AI question record
            ai_question, q_created = AIInterviewQuestion.objects.get_or_create(
                question_text=question_text,
                defaults={
                    'question_type': question_data.get('question_type', 'general'),
                    'difficulty_level': question_data.get('difficulty_level', 'medium'),
                    'job_role': question_data.get('job_role', ''),
                    'skills_required': question_data.get('skills_required', []),
                    'expected_answer_points': expected_points,
                    'ai_generated': True
                }
            )
            
            # Create response record
            response_record = InterviewQuestionResponse.objects.create(
                conversation=conversation,
                question=ai_question,
                question_text=question_text,
                user_response=user_response,
                ai_evaluation=evaluation,
                score=evaluation.get('score'),
                feedback=evaluation.get('feedback', ''),
                strengths=evaluation.get('strengths', []),
                improvements=evaluation.get('improvements', []),
                follow_up_questions=evaluation.get('follow_up_questions', []),
                response_duration=response_duration
            )
            
            # Update conversation data
            conversation_data = conversation.conversation_data
            conversation_data.append({
                'type': 'question',
                'question_text': question_text,
                'question_data': question_data,
                'timestamp': timezone.now().isoformat()
            })
            conversation_data.append({
                'type': 'user_response',
                'response_text': user_response,
                'response_id': response_record.id,
                'timestamp': timezone.now().isoformat()
            })
            conversation.conversation_data = conversation_data
            conversation.save()
            
            # Generate follow-up question if appropriate
            follow_up_question = None
            if question_data.get('follow_up_potential', False) and evaluation.get('score', 0) >= 6:
                follow_up_question = ai_interview_service.generate_follow_up_question(
                    previous_question=question_text,
                    user_response=user_response,
                    job_context=job_context
                )
            
            return Response({
                'success': True,
                'evaluation': evaluation,
                'response_id': response_record.id,
                'follow_up_question': follow_up_question,
                'message': 'Response evaluated successfully'
            }, status=status.HTTP_200_OK)
            
        except InterviewConversation.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        log_error("submit_interview_response", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def end_ai_interview(request):
    """End AI interview session and generate comprehensive evaluation"""
    try:
        from .services.ai_interview_service import ai_interview_service
        
        data = request.data
        conversation_id = data.get('conversation_id')
        
        if not conversation_id:
            return Response({
                'success': False,
                'error': 'conversation_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            conversation = InterviewConversation.objects.get(id=conversation_id)
            
            # Verify user owns this conversation
            if conversation.session.booking.user != request.user:
                return Response({
                    'success': False,
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update session end time
            session = conversation.session
            session.ended_at = timezone.now()
            session.save()
            
            # Generate comprehensive interview summary using AI
            summary = ai_interview_service.generate_interview_summary(
                conversation_data=conversation.conversation_data,
                job_description=conversation.job_description
            )
            
            # Update conversation with final evaluation
            conversation.ai_evaluation = summary
            conversation.overall_score = summary.get('overall_score')
            conversation.strengths = summary.get('strengths', [])
            conversation.areas_for_improvement = summary.get('areas_for_improvement', [])
            conversation.recommendations = summary.get('recommendations', '')
            conversation.save()
            
            # Update booking status to completed
            booking = session.booking
            booking.status = 'completed'
            booking.save()
            
            return Response({
                'success': True,
                'summary': summary,
                'session_duration': session.duration_minutes,
                'total_questions': conversation.total_questions,
                'total_responses': conversation.total_user_responses,
                'message': 'Interview completed successfully'
            }, status=status.HTTP_200_OK)
            
        except InterviewConversation.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        log_error("end_ai_interview", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_interview_conversation(request, conversation_id):
    """Get interview conversation details and responses"""
    try:
        conversation = InterviewConversation.objects.get(id=conversation_id)
        
        # Verify user owns this conversation
        if conversation.session.booking.user != request.user:
            return Response({
                'success': False,
                'error': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all responses for this conversation
        responses = InterviewQuestionResponse.objects.filter(conversation=conversation).order_by('created_at')
        
        conversation_data = {
            'conversation': InterviewConversationSerializer(conversation).data,
            'responses': InterviewQuestionResponseSerializer(responses, many=True).data,
            'session_details': InterviewSessionSerializer(conversation.session).data,
            'booking_details': InterviewBookingSerializer(conversation.session.booking).data
        }
        
        return Response({
            'success': True,
            'data': conversation_data
        }, status=status.HTTP_200_OK)
        
    except InterviewConversation.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        log_error("get_interview_conversation", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_interview_history(request):
    """Get user's interview history with AI evaluations"""
    try:
        user = request.user
        
        # Get all conversations for the user
        conversations = InterviewConversation.objects.filter(
            session__booking__user=user
        ).order_by('-created_at')
        
        conversation_list = []
        for conv in conversations:
            conv_data = InterviewConversationSerializer(conv).data
            conv_data['session_summary'] = {
                'date': conv.session.booking.slot.date,
                'time': conv.session.booking.slot.start_time,
                'duration': conv.session.duration_minutes,
                'status': conv.session.booking.status
            }
            conversation_list.append(conv_data)
        
        return Response({
            'success': True,
            'conversations': conversation_list,
            'total_interviews': len(conversation_list)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("get_user_interview_history", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Referral System API Endpoints
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_referral_code(request):
    """Get or create referral code for authenticated user"""
    try:
        user = request.user
        
        # Get or create referral code for user
        referral_code, created = ReferralCode.objects.get_or_create(
            user=user,
            defaults={'is_active': True}
        )
        
        serializer = ReferralCodeSerializer(referral_code)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Referral code created' if created else 'Referral code retrieved'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("get_referral_code", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_referral_stats(request):
    """Get referral statistics for authenticated user"""
    try:
        user = request.user
        
        # Get or create referral code
        referral_code, created = ReferralCode.objects.get_or_create(
            user=user,
            defaults={'is_active': True}
        )
        
        # Get referrals made by this user
        referrals = UserReferral.objects.filter(referrer=user).order_by('-created_at')[:10]
        
        stats_data = {
            'total_referrals': referrals.count(),
            'active_referral_code': referral_code.code,
            'referral_link': referral_code.referral_link,
            'recent_referrals': UserReferralSerializer(referrals, many=True).data
        }
        
        serializer = ReferralStatsSerializer(stats_data)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("get_referral_stats", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['GET'])
@permission_classes([AllowAny])
def validate_referral_code(request):
    """Validate a referral code (public endpoint)"""
    try:
        code = request.GET.get('code')
        
        if not code:
            return Response({
                'success': False,
                'error': 'Referral code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            referral_code = ReferralCode.objects.get(code=code, is_active=True)
            
            return Response({
                'success': True,
                'valid': True,
                'referrer_email': referral_code.user.email,
                'message': 'Valid referral code'
            }, status=status.HTTP_200_OK)
            
        except ReferralCode.DoesNotExist:
            return Response({
                'success': True,
                'valid': False,
                'message': 'Invalid referral code'
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("validate_referral_code", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_enhanced_referral_stats(request):
    """Get enhanced referral statistics with achievements and ranking"""
    try:
        user = request.user
        
        # Get or create referral code
        referral_code, created = ReferralCode.objects.get_or_create(
            user=user,
            defaults={'is_active': True}
        )
        
        # Get referrals made by this user
        referrals = UserReferral.objects.filter(referrer=user).order_by('-created_at')[:10]
        total_referrals = referrals.count()
        
        # Get user's achievements
        user_achievements = UserReferralAchievement.objects.filter(user=user).order_by('-unlocked_at')
        
        # Get next achievement
        next_achievement = ReferralAchievement.objects.filter(
            threshold__gt=total_referrals,
            is_active=True
        ).order_by('threshold').first()
        
        # Get user's rank
        current_rank = None
        leaderboard_position = None
        try:
            leaderboard_entry = ReferralLeaderboard.objects.get(user=user, period='all_time')
            current_rank = leaderboard_entry.rank
            leaderboard_position = leaderboard_entry.rank
        except ReferralLeaderboard.DoesNotExist:
            # Calculate rank if not in leaderboard
            users_with_more_referrals = UserReferral.objects.values('referrer').annotate(
                count=Count('referrer')
            ).filter(count__gt=total_referrals).count()
            current_rank = users_with_more_referrals + 1
        
        stats_data = {
            'total_referrals': total_referrals,
            'active_referral_code': referral_code.code,
            'referral_link': referral_code.referral_link,
            'recent_referrals': referrals,
            'achievements': user_achievements,
            'next_achievement': next_achievement,
            'current_rank': current_rank,
            'leaderboard_position': leaderboard_position
        }
        
        serializer = EnhancedReferralStatsSerializer(stats_data)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("get_enhanced_referral_stats", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_referral_leaderboard(request):
    """Get referral leaderboard"""
    try:
        period = request.GET.get('period', 'all_time')
        limit = int(request.GET.get('limit', 10))
        
        # Get leaderboard entries
        leaderboard_entries = ReferralLeaderboard.objects.filter(
            period=period
        ).order_by('rank')[:limit]
        
        serializer = ReferralLeaderboardSerializer(leaderboard_entries, many=True)
        
        return Response({
            'success': True,
            'data': {
                'leaderboard': serializer.data,
                'period': period,
                'total_entries': leaderboard_entries.count()
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("get_referral_leaderboard", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def claim_achievement_reward(request):
    """Claim a referral achievement reward"""
    try:
        achievement_id = request.data.get('achievement_id')
        
        if not achievement_id:
            return Response({
                'success': False,
                'error': 'Achievement ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_achievement = UserReferralAchievement.objects.get(
                user=request.user,
                achievement_id=achievement_id
            )
        except UserReferralAchievement.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Achievement not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if user_achievement.is_claimed:
            return Response({
                'success': False,
                'error': 'Reward already claimed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Claim the reward
        user_achievement.claim_reward()
        
        return Response({
            'success': True,
            'message': 'Reward claimed successfully',
            'achievement': UserReferralAchievementSerializer(user_achievement).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("claim_achievement_reward", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def update_leaderboard(request):
    """Update referral leaderboard (admin endpoint)"""
    try:
        from django.db.models import Count
        
        # Get all users with their referral counts
        referral_counts = UserReferral.objects.values('referrer').annotate(
            count=Count('referrer')
        ).order_by('-count')
        
        # Update leaderboard
        ReferralLeaderboard.objects.filter(period='all_time').delete()
        
        for rank, item in enumerate(referral_counts, 1):
            user_id = item['referrer']
            count = item['count']
            
            ReferralLeaderboard.objects.create(
                user_id=user_id,
                referral_count=count,
                rank=rank,
                period='all_time'
            )
        
        return Response({
            'success': True,
            'message': f'Leaderboard updated with {len(referral_counts)} entries'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        log_error("update_leaderboard", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def apply_referral_code(request):
    """Apply a referral code to the authenticated user (one-time only)"""
    try:
        user = request.user
        
        # Check if user has already applied a referral code
        if hasattr(user, 'referral_application') and user.referral_application.is_active:
            return Response({
                'success': False,
                'error': 'You have already applied a referral code and cannot change it'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate input
        serializer = ApplyReferralCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid referral code format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        referral_code_value = serializer.validated_data['referral_code']
        
        # Check if referral code exists and is active
        try:
            referral_code = ReferralCode.objects.get(code=referral_code_value, is_active=True)
        except ReferralCode.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Invalid or inactive referral code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is trying to apply their own referral code
        if referral_code.user == user:
            return Response({
                'success': False,
                'error': 'You cannot apply your own referral code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create referral application
        application = ReferralCodeApplication.objects.create(
            user=user,
            applied_referral_code=referral_code
        )
        
        # Create referral relationship
        UserReferral.objects.create(
            referrer=referral_code.user,
            referred_user=user,
            referral_code=referral_code
        )
        
        # Return success response
        application_serializer = ReferralCodeApplicationSerializer(application)
        return Response({
            'success': True,
            'message': 'Referral code applied successfully!',
            'data': application_serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        log_error("apply_referral_code", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_applied_referral_code(request):
    """Get the referral code applied by the authenticated user"""
    try:
        user = request.user
        
        if not hasattr(user, 'referral_application') or not user.referral_application.is_active:
            return Response({
                'success': True,
                'data': None,
                'message': 'No referral code applied'
            })
        
        application_serializer = ReferralCodeApplicationSerializer(user.referral_application)
        return Response({
            'success': True,
            'data': application_serializer.data
        })
        
    except Exception as e:
        log_error("get_applied_referral_code", str(e))
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_cover_letter(request):
    """Generate cover letter using Groq AI based on job description and user profile"""
    try:
        import sys
        import os
        from django.conf import settings
        
        # Add the path to the GROQ API manager
        sys.path.append(os.path.join(settings.BASE_DIR, 'bkend_function', 'individual', 'overallrating'))
        
        try:
            from groq_api_manager_round_robin import groq_round_robin_manager
            groq_manager = groq_round_robin_manager
        except ImportError:
            try:
                from groq_api_manager import groq_manager
            except ImportError:
                return JsonResponse({
                    'success': False,
                    'error': 'Groq API manager not available'
                }, status=500)
        
        # Get data from request
        job_title = request.data.get('job_title', '')
        job_description = request.data.get('job_description', '')
        company_name = request.data.get('company_name', '')
        applicant_name = request.data.get('applicant_name', '')
        applicant_experience = request.data.get('applicant_experience', '')
        applicant_skills = request.data.get('applicant_skills', '')
        applicant_current_position = request.data.get('applicant_current_position', '')
        applicant_current_company = request.data.get('applicant_current_company', '')
        
        # Validate required fields
        if not job_title or not job_description:
            return JsonResponse({
                'success': False,
                'error': 'Job title and description are required'
            }, status=400)
        
        # Create the prompt for cover letter generation
        prompt = f"""
        Generate a professional cover letter for the following job application nomre than 1450 characters:

        Job Title: {job_title}
        Company: {company_name}
        Job Description: {job_description}

        Applicant Information:
        - Name: {applicant_name}
        - Current Position: {applicant_current_position}
        - Current Company: {applicant_current_company}
        - Experience Level: {applicant_experience}
        - Skills: {applicant_skills}

        Please generate a compelling cover letter that:
        1. Is professional and well-structured
        2. Highlights relevant skills and experience
        3. Shows enthusiasm for the specific role and company
        4. Is personalized and not generic
        5. Is between 200-400 words
        6. Uses a professional but engaging tone
        7. Includes specific examples of how the applicant's skills match the job requirements

        Format the cover letter properly with appropriate salutation and closing.
        """
        
        # Make request to Groq
        response = groq_manager.make_request(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )
        
        cover_letter = response.choices[0].message.content.strip()
        
        return JsonResponse({
            'success': True,
            'cover_letter': cover_letter
        })
        
    except Exception as e:
        print(f"Error generating cover letter: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to generate cover letter. Please try again.'
        }, status=500)
