import requests

def get_location(ip):

    try:

        response = requests.get(
            f"http://ip-api.com/json/{ip}"
        )

        data = response.json()

        return {
            "country": data.get("country"),
            "city": data.get("city")
        }

    except:
        return {
            "country": "Unknown",
            "city": "Unknown"
        }