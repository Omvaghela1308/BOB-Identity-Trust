def calculate_risk(
    new_device=False,
    trusted_device=False,
    night_login=False,
):

    score = 0
    reasons = []

    if new_device:
        score += 40
        reasons.append("New Device")

    if trusted_device:
        score -= 20
        reasons.append("Trusted Device")

    if night_login:
        score += 20
        reasons.append("Night Login")

    score = max(score, 0)

    if score <= 30:
        level = "LOW"

    elif score <= 70:
        level = "MEDIUM"

    else:
        level = "HIGH"

    return score, level, ", ".join(reasons)