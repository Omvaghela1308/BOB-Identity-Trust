import random
from django.conf import settings
from .models import OTPVerification
from .otp_sender import send_mail_async

def generate_otp():
    return str(
        random.randint(
            100000,
            999999
        )
    )

def create_and_send_otp(user):
    otp = generate_otp()
    OTPVerification.objects.create(
        user=user,
        otp=otp
    )
    
    send_mail_async(
        "Identity Verification OTP",
        f"Your OTP is {otp}",
        [user.email]
    )
    
    return otp