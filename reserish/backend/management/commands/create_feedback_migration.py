# from django.core.management.base import BaseCommand
# from django.core.management import call_command
# from django.db import connection
# import os

# class Command(BaseCommand):
#     help = 'Create and apply migrations for feedback system'

#     def handle(self, *args, **options):
#         try:
#             self.stdout.write('Creating feedback system migrations...')
            
#             # Create migrations
#             call_command('makemigrations', 'backend')
            
#             self.stdout.write('Applying migrations...')
            
#             # Apply migrations
#             call_command('migrate')
            
#             self.stdout.write(
#                 self.style.SUCCESS('Successfully created and applied feedback system migrations!')
#             )
            
#             # Verify models are created
#             with connection.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT table_name 
#                     FROM information_schema.tables 
#                     WHERE table_schema = 'public' 
#                     AND table_name IN ('backend_feedback', 'backend_feedbackreminder')
#                 """)
#                 tables = cursor.fetchall()
                
#                 if tables:
#                     self.stdout.write(
#                         self.style.SUCCESS(f'Feedback tables created: {[table[0] for table in tables]}')
#                     )
#                 else:
#                     self.stdout.write(
#                         self.style.WARNING('No feedback tables found. Check if migrations were applied correctly.')
#                     )
                    
#         except Exception as e:
#             self.stdout.write(
#                 self.style.ERROR(f'Error creating/applying migrations: {str(e)}')
#             )
#             raise
