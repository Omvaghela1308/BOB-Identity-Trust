def calculate_transaction_risk(amount):

    score = 0

    if amount > 10000:
        score += 30

    if amount > 50000:
        score += 50

    if amount > 100000:
        score += 80

    return score