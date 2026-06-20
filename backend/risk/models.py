from django.db import models
from django.conf import settings


class RiskScore(models.Model):

    RISK_LEVELS = [
        ('LOW', 'LOW'),
        ('MEDIUM', 'MEDIUM'),
        ('HIGH', 'HIGH'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='risk_scores'
    )

    score = models.IntegerField(default=0)

    reason = models.TextField(
        blank=True,
        null=True
    )

    risk_level = models.CharField(
        max_length=20,
        choices=RISK_LEVELS,
        default='LOW'
    )

    decision = models.CharField(
        max_length=20,
        default='ALLOW'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.score} ({self.risk_level})"


class RiskEvent(models.Model):

    EVENT_TYPES = [
        ('LOGIN', 'LOGIN'),
        ('TRANSACTION', 'TRANSACTION'),
        ('PASSWORD_CHANGE', 'PASSWORD_CHANGE'),
        ('PROFILE_UPDATE', 'PROFILE_UPDATE'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES
    )

    description = models.TextField()

    risk_points = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.event_type}"


class BehavioralRisk(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    score = models.IntegerField()

    reason = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.score}"
        )