import hashlib


def generate_device_id(user_agent, ip):

    raw_string = f"{user_agent}-{ip}"

    return hashlib.sha256(
        raw_string.encode()
    ).hexdigest()