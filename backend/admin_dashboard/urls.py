from django.urls import path
from .views import AdminMetricsView, AdminUsersSummaryView

urlpatterns = [
    path('metrics', AdminMetricsView.as_view(), name='admin_metrics'),
    path('users-summary', AdminUsersSummaryView.as_view(), name='admin_users_summary'),
]