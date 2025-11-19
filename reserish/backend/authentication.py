# authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        
        if not user.is_active:
            raise exceptions.AuthenticationFailed('User inactive or deleted')

        # This is the key line that makes is_authenticated work
        user.is_authenticated = True
        
        return (user, validated_token)