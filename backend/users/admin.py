from django.contrib import admin
from .models import User

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'phone', 'aadhaar', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone')
    list_filter = ('is_staff', 'is_active', 'is_superuser')

admin.site.register(User, CustomUserAdmin)
