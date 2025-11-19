from django.contrib.auth.hashers import check_password

# User input
raw_password = 'admin'

# Stored hash from DB
stored_hash = 'pbkdf2_sha256$870000$k3lP78OqcumNI2spaFos4a$kLK19bVtTXCf9lbUPQq3rxkz+BmhE7WsJCnlZvYmkUE='

# Check if they match
if check_password(raw_password, stored_hash):
    print("Password is correct!")
else:
    print("Wrong password.")
