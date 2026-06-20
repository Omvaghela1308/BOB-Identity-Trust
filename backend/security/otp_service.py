import random

from django.core.mail import send_mail
from django.conf import settings

from .models import OTPVerification


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

    send_mail(
        "Identity Verification OTP",
        f"Your OTP is {otp}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False
    )

    return otp