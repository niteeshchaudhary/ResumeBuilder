from django.core.management.base import BaseCommand
from backend.models import Plan

class Command(BaseCommand):
    help = 'Seeds the backend_plan table if empty'

    def handle(self, *args, **kwargs):
        if Plan.objects.exists():
            self.stdout.write(self.style.SUCCESS("Plans already exist. Skipping seeding."))
            return

        plans = [
            Plan(name='Free', price_month=0.00, price_qyear=0.00, price_hyear=0.00, price_year=0.00, level=1,
                 features='Resume Creation;Resume Grading;Resume Overview'),
            Plan(name='Standard', price_month=29.00, price_qyear=79.00, price_hyear=149.00, price_year=249.00, level=2,
                 features='Resume Creation from stored data;Job Finding;Email Support'),
            Plan(name='Premium', price_month=49.00, price_qyear=129.00, price_hyear=249.00, price_year=399.00, level=3,
                 features='Resume Creation;Resume Grading;Resume Overview;Resume Creation using AI;Priority Email Support 24/7'),
            Plan(name='Free', price_month=0.00, price_qyear=0.00, price_hyear=0.00, price_year=0.00, level=1,
                 features='Access all feature for a week'),
            Plan(name='Standard', price_month=149.00, price_qyear=399.00, price_hyear=699.00, price_year=1099.00, level=2,
                 features='Filter Best Suitable Resume;Priority Support'),
            Plan(name='Premium', price_month=199.00, price_qyear=499.00, price_hyear=799.00, price_year=1459.00, level=3,
                 features='Resume Creation;Resume Grading;Resume Overview;Resume Creation using AI;Priority Email Support 24/7;Post Jobs;'),
        ]

        Plan.objects.bulk_create(plans)
        self.stdout.write(self.style.SUCCESS("Plans seeded successfully."))
