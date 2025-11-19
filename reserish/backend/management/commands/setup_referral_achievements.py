from django.core.management.base import BaseCommand
from backend.models import ReferralAchievement


class Command(BaseCommand):
    help = 'Set up default referral achievements'

    def handle(self, *args, **options):
        achievements = [
            {
                'name': 'First Referral',
                'description': 'Welcome to the referral program! You\'ve made your first referral.',
                'threshold': 1,
                'reward_type': 'badge',
                'reward_value': 'First Referral Badge',
                'icon': '🎯',
                'color': 'blue'
            },
            {
                'name': 'Referral Rookie',
                'description': 'You\'re getting the hang of this! 5 referrals completed.',
                'threshold': 5,
                'reward_type': 'discount',
                'reward_value': '10% off next purchase',
                'icon': '🥉',
                'color': 'bronze'
            },
            {
                'name': 'Referral Enthusiast',
                'description': 'Great job! You\'ve referred 10 people to our platform.',
                'threshold': 10,
                'reward_type': 'premium_days',
                'reward_value': '7 days free premium',
                'icon': '🥈',
                'color': 'silver'
            },
            {
                'name': 'Referral Champion',
                'description': 'Outstanding! 25 referrals and counting.',
                'threshold': 25,
                'reward_type': 'premium_days',
                'reward_value': '30 days free premium',
                'icon': '🥇',
                'color': 'gold'
            },
            {
                'name': 'Referral Master',
                'description': 'Incredible! You\'ve referred 50 people. You\'re a true ambassador!',
                'threshold': 50,
                'reward_type': 'special_access',
                'reward_value': 'VIP status + 50% off forever',
                'icon': '👑',
                'color': 'purple'
            },
            {
                'name': 'Referral Legend',
                'description': 'Legendary! 100 referrals achieved. You\'re a referral superstar!',
                'threshold': 100,
                'reward_type': 'special_access',
                'reward_value': 'Lifetime premium + exclusive features',
                'icon': '🌟',
                'color': 'rainbow'
            }
        ]

        created_count = 0
        for achievement_data in achievements:
            achievement, created = ReferralAchievement.objects.get_or_create(
                threshold=achievement_data['threshold'],
                defaults=achievement_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Achievement already exists: {achievement.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully set up {created_count} new achievements!')
        )
