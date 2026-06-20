from django.urls import path
from .views import SimulateRiskView

urlpatterns = [
    path('simulate', SimulateRiskView.as_view(), name='simulate_risk'),
]
