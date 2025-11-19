import os
import shutil
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates an admin superuser if not exists'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        if not User.objects.filter(email='admin@gmail.com').exists():
            User.objects.create_superuser(
                email='admin@gmail.com',
                password='admin'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created!'))
        else:
            self.stdout.write('Admin user already exists.')

        # Define paths
        migmedia_path = os.path.join(settings.BASE_DIR, 'migmedia')
        media_path = settings.MEDIA_ROOT

        if not os.path.exists(migmedia_path):
            self.stdout.write(self.style.ERROR(f"'migmedia' folder not found at {migmedia_path}"))
            return

        # Copy folders from migmedia to media if not already present
        for item in os.listdir(migmedia_path):
            source_path = os.path.join(migmedia_path, item)
            dest_path = os.path.join(media_path, item)

            if os.path.isdir(source_path):
                if not os.path.exists(dest_path):
                    shutil.copytree(source_path, dest_path)
                    self.stdout.write(self.style.SUCCESS(f"Copied folder: {item}"))
                else:
                    self.stdout.write(f"Folder already exists: {item}")
