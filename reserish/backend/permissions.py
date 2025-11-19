# permissions.py
from rest_framework import permissions

class IsSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_seller)

def is_admin(user):
    return user.is_authenticated and user.is_staff
