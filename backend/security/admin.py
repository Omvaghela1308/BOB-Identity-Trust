from django.contrib import admin
from .models import (
    Device,
    LoginHistory,
    SecurityAlert,
    OTPVerification
)

admin.site.register(Device)
admin.site.register(LoginHistory)
admin.site.register(SecurityAlert)
admin.site.register(OTPVerification)