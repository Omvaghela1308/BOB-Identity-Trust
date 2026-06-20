# pyrefly: ignore [missing-import]
from django.urls import path
from .views import (
    RegisterView,
    SendOTPView,
    VerifyOTPView,
    ProfileView
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('send-otp', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp', VerifyOTPView.as_view(), name='verify_otp'),
    path('profile', ProfileView.as_view(), name='profile'),
]
