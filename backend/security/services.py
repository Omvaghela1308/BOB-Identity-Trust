from user_agents import parse

from .models import Device
from .device_fingerprint import generate_device_id


def get_browser_info(user_agent):

    ua = parse(user_agent)

    return {
        "browser": ua.browser.family,
        "os": ua.os.family,
        "device": ua.device.family
    }


def register_device(user, request):

    user_agent = request.META.get(
        'HTTP_USER_AGENT',
        'Unknown'
    )

    ip = request.META.get(
        'REMOTE_ADDR',
        '0.0.0.0'
    )

    browser_info = get_browser_info(
        user_agent
    )

    device_id = generate_device_id(
        user_agent,
        ip
    )

    device, created = Device.objects.get_or_create(
        user=user,
        device_id=device_id,
        defaults={
            'browser': browser_info['browser'],
            'operating_system': browser_info['os'],
            'device_type': browser_info['device'],
            'ip_address': ip,
            'trusted': False
        }
    )

    return device, created