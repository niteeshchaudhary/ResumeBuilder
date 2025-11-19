from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from backend.models import Plan, UserReferral, ReferralAchievement, UserReferralAchievement
from django.db.models import Count

@receiver(post_migrate)
def insert_initial_data(sender, **kwargs):
    pass
    # if Plan.objects.exists():
    #     return
    # Plan.objects.create(field1='value1', field2='value2')

@receiver(post_save, sender=UserReferral)
def check_referral_achievements(sender, instance, created, **kwargs):
    """Check and unlock achievements when a new referral is created"""
    if created:
        user = instance.referrer
        referral_count = UserReferral.objects.filter(referrer=user).count()
        
        # Get all achievements that this user should have unlocked
        eligible_achievements = ReferralAchievement.objects.filter(
            threshold__lte=referral_count,
            is_active=True
        )
        
        for achievement in eligible_achievements:
            # Create achievement if it doesn't exist
            UserReferralAchievement.objects.get_or_create(
                user=user,
                achievement=achievement
            )