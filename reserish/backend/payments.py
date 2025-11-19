import razorpay
from dotenv import load_dotenv
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'), override=False)
client = razorpay.Client(auth=(os.getenv("RAZORPAY_API_KEY",""), os.getenv("RAZORPAY_API_SECRET","")))

DATA = {
    "amount": 5000,
    "currency": "INR",
    "receipt": "receipt#1",
    "notes": {
        "key1": "value3",
        "key2": "value2"
    }
}
client.order.create(data=DATA)