from django.core.management.base import BaseCommand
from django.db.models import Count
from backend.models import CustomUser, UserReferral, ReferralAchievement, UserReferralAchievement


class Command(BaseCommand):
    help = 'Check and unlock referral achievements for all users'

    def handle(self, *args, **options):
        # Get all users with their referral counts
        users_with_referrals = UserReferral.objects.values('referrer').annotate(
            count=Count('referrer')
        )
        
        unlocked_count = 0
        
        for user_data in users_with_referrals:
            user_id = user_data['referrer']
            referral_count = user_data['count']
            
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                continue
            
            # Get all achievements that this user should have unlocked
            eligible_achievements = ReferralAchievement.objects.filter(
                threshold__lte=referral_count,
                is_active=True
            )
            
            for achievement in eligible_achievements:
                # Check if user already has this achievement
                user_achievement, created = UserReferralAchievement.objects.get_or_create(
                    user=user,
                    achievement=achievement
                )
                
                if created:
                    unlocked_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Unlocked "{achievement.name}" for {user.email}')
                    )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully unlocked {unlocked_count} new achievements!')
        )
