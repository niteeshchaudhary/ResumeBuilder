from django.contrib import admin

from .models import *
from django.http import JsonResponse
from django.forms import Media
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
# from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'amount', 'status', 'created_at')
    list_filter = ('status', 'plan', 'created_at')
    search_fields = ('user__email', 'razorpay_payment_id', 'razorpay_order_id')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)



class UserAdmin(admin.ModelAdmin):
    # other configurations
    pass

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id','email', 'is_enterprise', 'is_staff', 'is_active')
    list_filter = ('is_enterprise', 'is_staff', 'is_active')

admin.site.register(Plan)
admin.site.register(Job)
admin.site.register(JobApplication)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Feedback)
admin.site.register(UserAccount)
admin.site.register(Templates)
admin.site.register(PersonalInfo)
admin.site.register(Experience)
admin.site.register(Education)
admin.site.register(Project)
admin.site.register(Skill)
admin.site.register(Achievement)
admin.site.register(Certification)
admin.site.register(Publications)
admin.site.register(InterviewSlot)
admin.site.register(InterviewBooking)
admin.site.register(ReferralCode)
admin.site.register(ReferralAchievement)
admin.site.register(UserReferral)
admin.site.register(UserReferralAchievement)
admin.site.register(ReferralLeaderboard)
admin.site.register(ReferralCodeApplication)




# admin.site.register(Order)
# admin.site.register(OrderItem)
# admin.site.register(Product, ProductAdmin)

