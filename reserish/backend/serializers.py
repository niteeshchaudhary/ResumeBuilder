from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','active_plan','plan_duration','plan_activated_on','plan_expiry_date', 'email','profile_picture','address','phone_number','is_enterprise')

class RegisterSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(max_length=20, required=False, allow_blank=True, write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('email', 'password','is_enterprise','rid', 'referral_code')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        referral_code = validated_data.pop('referral_code', None)
        user=None
        if validated_data['is_enterprise']:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                is_enterprise=validated_data['is_enterprise'],
                rid=validated_data['rid'],
                is_active=False
            )
        else:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                is_enterprise=validated_data['is_enterprise'],
                is_active=False
            )

        user.save()
        
        # Handle referral code if provided
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
        
        return user
        
# serializers.py
class TransactionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    currency_symbol = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'plan_name',
            'amount',
            'currency',
            'currency_symbol',
            'status',
            'created_at',
            'payment_id'
        ]

    def get_currency_symbol(self, obj):
        return '₹' if obj.currency == 'INR' else '$'
    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        return token
    


# ************************************************
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'id',
            'feature_name', 
            'rating', 
            'detailed_feedback',
            'ip_address',
            'user_agent',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Get user from request context
        request = self.context.get('request')
        if request:
            validated_data['user'] = request.user
        
        # Get IP address and user agent
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class FeedbackReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackReminder
        fields = [
            'id',
            'feature_name',
            'reminder_time',
            'is_sent',
            'created_at'
        ]
        read_only_fields = ['id', 'is_sent', 'created_at']
        
class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id','name','price')

        
class ProductsModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # 'name','image'
        fields = ['email','address', 'phone_number']
        
class CustomUserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        print(validated_data)
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
        
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductsModelSerializer()
    
    class Meta:
        model = CartItem
        fields = ['product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    user = CustomUserModelSerializer()
    cart_items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductsModelSerializer()

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']


class shortOrderSerializer(serializers.ModelSerializer):
    # user = CustomUserModelSerializer()
    # order_items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id','created_at','payment_status','total_amount'] 

class OrderSerializer(serializers.ModelSerializer):
    user = CustomUserModelSerializer()
    order_items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__' #['id', 'user','products', 'order_items', 'created_at', 'total_amount',
        #           'status', 'delivery_address', 'order_description',
        #           'estimated_delivery_time', 'seller_info']




# class JobSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Job
#         # fields = '__all__'
#         fields = ["title","location","profession","job_type" ,"discipline", "description", "skills", "experience", "company"]



class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['applicant']  



class JobPostingSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source='company.email', read_only=True)
    total_applicants = serializers.IntegerField(read_only=True)
    class Meta:
        model = Job
        fields = '__all__'
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('applicants', None)  # 💥 Remove 'applicants' field if present
        return data

    def create(self, validated_data):
        # Convert skills from list to comma-separated string
        if 'skills' in validated_data and isinstance(validated_data['skills'], list):
            validated_data['skills'] = ','.join(validated_data['skills'])
        validated_data.get('status', 'active')
        return super().create(validated_data)
    
class JobApplicationUserSerializer(serializers.ModelSerializer):
    job = JobPostingSerializer()  # Nested job details

    class Meta:
        model = JobApplication
        fields = '__all__'

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'price_month','price_qyear','price_hyear','price_year', 'level', 'features']

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Templates
        fields = ['id', 'title', 'description','category','image']

class InterviewSlotSerializer(serializers.ModelSerializer):
    is_available = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    booked_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewSlot
        fields = '__all__'
    
    def get_booked_count(self, obj):
        return obj.interviewbookings.count()


class InterviewBookingSerializer(serializers.ModelSerializer):
    slot_details = InterviewSlotSerializer(source='slot', read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = InterviewBooking
        fields = '__all__'
        read_only_fields = ('meeting_link', 'meeting_id', 'created_at', 'updated_at')


class InterviewSessionSerializer(serializers.ModelSerializer):
    booking_details = InterviewBookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = InterviewSession
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class AIInterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewQuestion
        fields = '__all__'


class InterviewQuestionResponseSerializer(serializers.ModelSerializer):
    question_details = AIInterviewQuestionSerializer(source='question', read_only=True)
    
    class Meta:
        model = InterviewQuestionResponse
        fields = '__all__'
        read_only_fields = ('created_at',)


class InterviewConversationSerializer(serializers.ModelSerializer):
    responses = InterviewQuestionResponseSerializer(many=True, read_only=True)
    session_details = InterviewSessionSerializer(source='session', read_only=True)
    
    class Meta:
        model = InterviewConversation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


# Referral System Serializers
class ReferralCodeSerializer(serializers.ModelSerializer):
    referral_link = serializers.SerializerMethodField()
    total_referrals = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralCode
        fields = ['code', 'is_active', 'created_at', 'referral_link', 'total_referrals']
        read_only_fields = ['code', 'created_at', 'referral_link', 'total_referrals']
    
    def get_referral_link(self, obj):
        return obj.referral_link
    
    def get_total_referrals(self, obj):
        return obj.referrals.count()


class UserReferralSerializer(serializers.ModelSerializer):
    referred_user_email = serializers.CharField(source='referred_user.email', read_only=True)
    referred_user_name = serializers.SerializerMethodField()
    referral_code = serializers.CharField(source='referral_code.code', read_only=True)
    
    class Meta:
        model = UserReferral
        fields = ['id', 'referred_user_email', 'referred_user_name', 'referral_code', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_referred_user_name(self, obj):
        user = obj.referred_user
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.email.split('@')[0]


class ReferralStatsSerializer(serializers.Serializer):
    total_referrals = serializers.IntegerField()
    active_referral_code = serializers.CharField()
    referral_link = serializers.CharField()
    recent_referrals = UserReferralSerializer(many=True)


class ReferralAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralAchievement
        fields = ['id', 'name', 'description', 'threshold', 'reward_type', 'reward_value', 'icon', 'color']


class UserReferralAchievementSerializer(serializers.ModelSerializer):
    achievement = ReferralAchievementSerializer(read_only=True)
    
    class Meta:
        model = UserReferralAchievement
        fields = ['id', 'achievement', 'unlocked_at', 'is_claimed', 'claimed_at']


class ReferralLeaderboardSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralLeaderboard
        fields = ['rank', 'user_email', 'user_name', 'referral_count', 'updated_at']
    
    def get_user_name(self, obj):
        user = obj.user
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.email.split('@')[0]


class EnhancedReferralStatsSerializer(serializers.Serializer):
    total_referrals = serializers.IntegerField()
    active_referral_code = serializers.CharField()
    referral_link = serializers.CharField()
    recent_referrals = UserReferralSerializer(many=True)
    achievements = UserReferralAchievementSerializer(many=True)
    next_achievement = ReferralAchievementSerializer(allow_null=True)
    current_rank = serializers.IntegerField(allow_null=True)
    leaderboard_position = serializers.IntegerField(allow_null=True)


class ReferralCodeApplicationSerializer(serializers.ModelSerializer):
    applied_referral_code = serializers.CharField(source='applied_referral_code.code', read_only=True)
    referrer_email = serializers.CharField(source='applied_referral_code.user.email', read_only=True)

    class Meta:
        model = ReferralCodeApplication
        fields = ['id', 'applied_referral_code', 'referrer_email', 'applied_at', 'is_active']
        read_only_fields = ['id', 'applied_at', 'is_active']


class ApplyReferralCodeSerializer(serializers.Serializer):
    referral_code = serializers.CharField(max_length=20, required=True)