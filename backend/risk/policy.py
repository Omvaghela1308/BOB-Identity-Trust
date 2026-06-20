def make_decision(score):

    if score <= 30:
        return "ALLOW"

    elif score <= 70:
        return "OTP"

    return "BLOCK"