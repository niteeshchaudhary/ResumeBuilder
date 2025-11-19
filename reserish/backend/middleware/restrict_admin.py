from django.http import HttpResponseForbidden
from django.conf import settings

class RestrictAdminMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/'):
            host = request.get_host().split(':')[0]
            print(f"RestrictAdminMiddleware: Host is {host}")
            # print(f"RestrictAdminMiddleware: ALLOWED_ADMIN_DOMAINS is {getattr(settings, 'ALLOWED_ADMIN_DOMAINS', [])}")
            if host not in getattr(settings, 'ALLOWED_ADMIN_DOMAINS', []):
                return HttpResponseForbidden("403 Forbidden: Admin not allowed from this domain.")
        return self.get_response(request)
