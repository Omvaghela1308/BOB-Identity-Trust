def detect_fraud(amount):

    fraud_score = 0

    reasons = []

    if amount > 50000:
        fraud_score += 40
        reasons.append(
            "Large Transaction"
        )

    if amount > 100000:
        fraud_score += 40
        reasons.append(
            "Very High Amount"
        )

    if amount > 500000:
        fraud_score += 20
        reasons.append(
            "Extremely High Amount"
        )

    return {
        "fraud_score": fraud_score,
        "reasons": reasons
    }