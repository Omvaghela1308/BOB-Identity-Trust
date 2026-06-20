from security.models import LoginHistory
from transactions.models import Transaction


def calculate_behavior_risk(user):

    score = 0

    recent_logins = LoginHistory.objects.filter(
        user=user
    ).count()

    recent_transactions = Transaction.objects.filter(
        user=user
    ).count()

    if recent_logins > 10:
        score += 20

    if recent_transactions > 20:
        score += 30

    return score