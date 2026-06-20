from rest_framework import serializers

class VerifyOTPSerializer(serializers.Serializer):

    username = serializers.CharField(
        required=True,
        max_length=150
    )

    otp = serializers.CharField(
        required=True,
        max_length=6
    )

