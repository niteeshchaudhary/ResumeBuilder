from django.apps import AppConfig
from django.db.models.signals import post_migrate
from .utils.mongolog import ensure_mongo_indexes
from django.conf import settings

class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'
    def ready(self):
        from . import signals 
        if settings.USE_MONGO:
            ensure_mongo_indexes()