import threading
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPVerification
from .otp_service import generate_otp

def send_mail_async(subject, message, recipient_list):
    """
    Sends an email asynchronously in a background thread to prevent
    blocking the main request-response cycle (and avoiding Gunicorn timeouts).
    """
    def run():
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False
            )
            print(f"[SECURITY] Async Email successfully dispatched to: {recipient_list}")
        except Exception as e:
            print(f"[SECURITY] Async SMTP Email dispatch failed! Details: {str(e)}")
            
    thread = threading.Thread(target=run)
    thread.start()

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