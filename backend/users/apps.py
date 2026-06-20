from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        from django.contrib.auth import get_user_model
        from django.db.utils import OperationalError, ProgrammingError
        try:
            User = get_user_model()
            # Auto-create superuser admin/admin123 if it doesn't exist
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
                print("[STARTUP] Auto-created superuser: admin / admin123")
            else:
                # Update password to ensure it matches
                admin_user = User.objects.get(username='admin')
                admin_user.set_password('admin123')
                admin_user.is_superuser = True
                admin_user.is_staff = True
                admin_user.save()
            
            # Reset sharaddarji2811 if exists
            sharad = User.objects.filter(username='sharaddarji2811').first()
            if sharad:
                sharad.set_password('admin123')
                sharad.is_superuser = True
                sharad.is_staff = True
                sharad.save()
                print("[STARTUP] Reset sharaddarji2811 password to admin123")
        except (OperationalError, ProgrammingError):
            pass
