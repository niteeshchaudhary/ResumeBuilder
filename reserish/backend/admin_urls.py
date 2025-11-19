from django.urls import path
from django.contrib.auth.decorators import user_passes_test
from . import views

def is_admin(user):
    return  user.is_staff

# Wrapper function to apply user_passes_test to all views
def admin_required(view_func):
    decorated_view_func = user_passes_test(is_admin)(view_func)
    return decorated_view_func

urlpatterns = [
    path('orders/', admin_required(views.admin_order_management), name='admin_order_management'),
    path('orders/update/<int:order_id>/', admin_required(views.update_order_status), name='update_order_status'),
    # Other URL patterns...
]