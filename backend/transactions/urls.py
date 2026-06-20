from django.urls import path
from .views import TransferView, VerifyStepUpView

urlpatterns = [
    path('transfer', TransferView.as_view(), name='transfer'),
    path('verify-stepup', VerifyStepUpView.as_view(), name='verify_stepup'),
]