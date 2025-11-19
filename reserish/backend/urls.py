from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve
from django.urls import re_path


urlpatterns = [
    path('', views.home, name='home'),
    path('api/reset-password/', views.PasswordResetRequestView.as_view()),
    path('api/reset-password-confirm/<uidb64>/<token>/', views.PasswordResetConfirmView.as_view()),
    # path('api/u/register/', views.RegisterUserView.as_view(), name='register_user'),
    # path('api/e/register/', views.RegisterEnterpriseView.as_view(), name='register_enterprise'),
    # path('api/e/login/', views.LoginEnterpriseView.as_view(), name='login_enterprise'),
    path('api/u/google-login/', views.use_google_auth, name='google_login'),
    path('api/register/', views.RegisterView.as_view(), name='register_account'),
    path('verify-email/<uidb64>/<token>/', views.verify_email, name='verify-email'),
    path('api/u/login/', views.LoginUView.as_view(), name='login_u_account'),
    path('api/e/login/', views.LoginEView.as_view(), name='login_e_account'),
    path('api/upload-profile-pic/', views.uploadProfilePic, name='profile_picture'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/complete-profile/', views.user_profile, name='complete-profile-api'),
    path('api/upload-job-file/', views.upload_job_file, name='upload-job-api'),
    path('api/upload-file/', views.upload_file, name='upload-api'),
    path('api/specific-rating/', views.specific_rating, name='specificl-api'),
    path('api/over-all-rating/', views.overall_rating, name='overall-api'),
    path('api/resume-parser/', views.resume_parser, name='resume-parser-api'),
    path('api/bulk-resume-upload/', views.BulkResumeUpload.as_view(), name='upload_bulk_resumes'),
    path('api/get_rephrase/', views.get_rephrased_content, name='get_rephrase'),
    # path('api/bulk-resume-upload-results/', views.bulk_resume_upload_results, name='upload_bulk_resumes_results'),
    path('api/templates/', views.get_templates, name='template-api'),

    path('api/transactions/', views.transaction_history),

    path('api/submit-job/', views.submit_job, name='submit_job'),
    path('api/templates/', views.list_templates, name='list_templates'),
    path('api/templates/<str:template_name>/', views.get_template_content, name='get_template_content'),
    path('api/userdata/<str:section_name>/', views.get_userdata, name='get_user'),
    path('api/setuserdata/<str:section_name>/', views.set_userdata, name='set_user'),
    path('api/deluserdata/<str:section_name>/', views.del_userdata, name='del_user'),
    path('api/compile-latex/', views.CompileLatexView.as_view(), name='compile-latex'),
    path('api/resume-with-ai/', views.generate_resume_with_ollama, name='resume_wit_hai'),
    path('api/resume-with-ai-ext/', views.generate_resume_ext, name='resume_wit_hai-ext'),
    path('api/payment/orders', views.PaymentOrderView.as_view(), name='payment-orders'),
    path('api/payment/success', views.PaymentSuccessView.as_view(), name='payment-success'),
    path('api/joblistings', views.joblistings, name='list-jobs'),
    path('api/enhanced-job-scraping/', views.enhanced_job_scraping, name='enhanced-job-scraping'),
    path('api/post-job/', views.JobPostingCreateView.as_view(), name='post-job'),

    path("api/joblisting/", views.JobListView.as_view(), name="job-list"),
    path("api/jobs/", views.JobCreateView.as_view(), name="job-list-create"),
    path("api/jobs/<int:job_id>/applications/", views.JobApplicationListView.as_view(), name="job-applications"),
    path("api/apply/", views.JobApplicationCreateView.as_view(), name="apply-job"),
    path("api/my-jobs/", views.MyPostedJobsView.as_view(), name="my-posted-jobs"),
    path("api/close-job/", views.change_job_status, name="job-close"),
    path("api/job/myapplications/", views.JobApplicationUserListView.as_view(), name="get-applications"),
    # path("api/job/<int:pk>/", views.JobDetailView.as_view(), name="job-detail"),
    path("api/job/applications/", views.JobApplicationListView.as_view(), name="job-applications-list"),
    path("api/applications/<int:pk>/", views.JobApplicationUpdateView.as_view(), name="update-application"),

    path('api/get_plans/', views.get_plans),
    path('api/get_offered_plans/', views.get_offered_plans),
    path('api/initiate_payment/', views.initiate_razor_payment),
    path('api/cashfree/initiate', views.initiate_cashfree_payment),
    path('api/cashfree/payment_status', views.cashfree_payment_status),
    path('api/cashfree/webhook', views.cashfree_webhook),
    path('api/downloadstatement/', views.download_statement),
    path('api/resend-verification/', views.resendVerificationLink,name="reverify"),
    path('api/contact-us/', views.contact_us,name="contact_us"),
    path('api/mailtest/', views.mail_test),
    path("api/logs/<token>", views.get_error_logs, name="get_error_logs"),
    # path('payment/<int:plan_id>/', views.payment_page, name='payment_page'),

    # Interview scheduling endpoints
    path('api/interview/slots/', views.get_available_slots, name='get_available_slots'),
    path('api/interview/slots/<int:slot_id>/', views.get_slot_details, name='get_slot_details'),
    path('api/interview/stats/', views.get_user_interview_stats, name='get_user_interview_stats'),
    path('api/interview/bookings/', views.get_user_bookings, name='get_user_bookings'),
    path('api/interview/book/', views.book_interview_slot, name='book_interview_slot'),
    path('api/interview/cancel/', views.cancel_interview_booking, name='cancel_interview_booking'),
    
    # AI Interview endpoints
    path('api/interview/ai/start/', views.start_ai_interview, name='start_ai_interview'),
    path('api/interview/ai/submit-response/', views.submit_interview_response, name='submit_interview_response'),
    path('api/interview/ai/end/', views.end_ai_interview, name='end_ai_interview'),
    path('api/interview/ai/conversation/<int:conversation_id>/', views.get_interview_conversation, name='get_interview_conversation'),
    path('api/interview/ai/history/', views.get_user_interview_history, name='get_user_interview_history'),
    
    # Feedback system endpoints
    path('api/feedback/submit/', views.submit_feedback, name='submit_feedback'),
    path('api/feedback/stats/', views.get_feedback_stats, name='get_feedback_stats'),
    path('api/feedback/reminder/', views.schedule_feedback_reminder, name='schedule_feedback_reminder'),
    path('api/feedback/history/', views.get_user_feedback_history, name='get_user_feedback_history'),
    path('api/feedback/<int:feedback_id>/', views.delete_feedback, name='delete_feedback'),
    
    # Referral system endpoints
    path('api/referral/code/', views.get_referral_code, name='get_referral_code'),
    path('api/referral/stats/', views.get_referral_stats, name='get_referral_stats'),
    path('api/referral/enhanced-stats/', views.get_enhanced_referral_stats, name='get_enhanced_referral_stats'),
    path('api/referral/validate/', views.validate_referral_code, name='validate_referral_code'),
    path('api/referral/leaderboard/', views.get_referral_leaderboard, name='get_referral_leaderboard'),
    path('api/referral/claim-reward/', views.claim_achievement_reward, name='claim_achievement_reward'),
    path('api/referral/update-leaderboard/', views.update_leaderboard, name='update_leaderboard'),
    path('api/referral/apply/', views.apply_referral_code, name='apply_referral_code'),
    path('api/referral/applied/', views.get_applied_referral_code, name='get_applied_referral_code'),
    
    # Cover letter generation endpoint
    path('api/generate-cover-letter/', views.generate_cover_letter, name='generate_cover_letter'),
]

urlpatterns += [
    # path('media/temp_latex/<int:user_id>/<str:filename>/', views.secure_serve_latex, name='secure_latex_file'),
    # path('media/profiles/<int:user_id>/<str:filename>/', views.secure_serve_profile, name='secure_user_pic'),
    re_path(r'^media/(?P<path>.*)$', static_serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]

# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)