import pickle
from django.contrib.auth import get_user_model
from backend.models import *

# Your session data (from Redis or file)
raw = b'\x80\x05\x95\xdf\x00\x00\x00\x00\x00\x00\x00}\x94(\x8c\n_csrftoken\x94\x8c Gdw2yKnbYzSPYt8JakTS7hYHDDwvifx7\x94\x8c\r_auth_user_id\x94\x8c\x011\x94\x8c\x12_auth_user_backend\x94\x8c)django.contrib.auth.backends.ModelBackend\x94\x8c\x0f_auth_user_hash\x94\x8c@33fc18d90d604dd44650dcc8b8b87db7421f54887251db51d3b67704c033e865\x94u.'  # your raw byte string

# Deserialize it
data = pickle.loads(raw)

user_id = data.get('_auth_user_id')
User = get_user_model()

# Now get the actual user
user = CustomUser.objects.get(pk=user_id)

print(user.username, user.email)