from django.contrib import admin
from .models import (
    Transaction,
    FraudCase
)

admin.site.register(Transaction)
admin.site.register(FraudCase)