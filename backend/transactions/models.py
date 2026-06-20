from django.db import models
from django.conf import settings


class Transaction(models.Model):

    TRANSACTION_TYPES = [
        ('PAYMENT', 'PAYMENT'),
        ('TRANSFER', 'TRANSFER'),
        ('WITHDRAWAL', 'WITHDRAWAL'),
        ('DEPOSIT', 'DEPOSIT'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('SUCCESS', 'SUCCESS'),
        ('FAILED', 'FAILED'),
        ('BLOCKED', 'BLOCKED'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True
    )

    transaction_type = models.CharField(
        max_length=50,
        choices=TRANSACTION_TYPES,
        default='TRANSFER'
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    receiver = models.CharField(
        max_length=255
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    risk_score = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.transaction_id} - {self.user.username}"


class FraudCase(models.Model):

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='fraud_cases'
    )

    fraud_score = models.IntegerField(
        default=0
    )

    reason = models.TextField()

    reviewed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"Fraud Case - "
            f"{self.transaction.transaction_id}"
        )