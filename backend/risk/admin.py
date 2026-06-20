from django.contrib import admin
from .models import (
    RiskScore,
    RiskEvent,
    BehavioralRisk
)
admin.site.register(RiskScore)
admin.site.register(RiskEvent)
admin.site.register(BehavioralRisk)