# pyrefly: ignore [missing-import]
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from security.models import OTPVerification, LoginHistory
from risk import state
from .models import User
from .serializers import RegisterSerializer
import random

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Registration successful"
        }, status=status.HTTP_201_CREATED)

class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"success": False, "message": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if not user:
            # Fallback to username check
            username = email.split('@')[0]
            user = User.objects.filter(username=username).first()
            if not user:
                return Response({
                    "success": False, 
                    "message": "No registered user found with this corporate email address."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate 4-digit OTP (matching frontend UI)
        otp = str(random.randint(1000, 9999))
        
        # Save to database
        OTPVerification.objects.create(
            user=user,
            otp=otp
        )
        
        # Print for development console logs
        print(f"\n========================================\n[SECURITY] OTP {otp} generated for {email}\n========================================\n")
        
        # Send mail via SMTP asynchronously to prevent blocking Gunicorn workers
        from security.otp_sender import send_mail_async
        send_mail_async(
            "Identity Verification OTP",
            f"Your identity verification OTP is {otp}",
            [user.email]
        )
            
        return Response({
            "success": True,
            "message": f"4-Digit verification code dispatched to {email}"
        })

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({"success": False, "message": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(email=email).first()
        if not user:
            username = email.split('@')[0]
            user = User.objects.filter(username=username).first()
            if not user:
                return Response({"success": False, "message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Allow test OTP 1234 or verify database OTP
        otp_valid = False
        if otp == '1234':
            otp_valid = True
        else:
            otp_record = OTPVerification.objects.filter(
                user=user,
                otp=otp,
                is_verified=False
            ).last()
            if otp_record:
                if otp_record.is_expired():
                    return Response({"success": False, "message": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
                otp_record.is_verified = True
                otp_record.save()
                otp_valid = True
            
        if not otp_valid:
            return Response({"success": False, "message": "Invalid OTP code. Use test OTP or check console logs."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine session characteristics based on active risk vector
        risk_vector = getattr(state, 'ACTIVE_RISK_VECTOR', 'Normal')
        
        if risk_vector == 'Normal':
            trust_score = 98
            risk_level = 'LOW'
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
            location = 'Mumbai, India'
            device_id = 'DEV-BOB-9842'
        elif risk_vector == 'NewDevice':
            trust_score = 65
            risk_level = 'MEDIUM'
            ip = '192.168.1.150'
            location = 'Bangalore, India'
            device_id = 'DEV-BOB-ANOMALY-99'
        else: # ImpossibleTravel
            trust_score = 24
            risk_level = 'HIGH'
            ip = '85.25.43.11'
            location = 'London, UK'
            device_id = 'DEV-BOB-ANOMALY-99'
            
        # Log to LoginHistory
        LoginHistory.objects.create(
            user=user,
            ip=ip,
            location=location,
            risk_score=100 - trust_score,
            status='SUCCESS'
        )
        
        # Generate JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "success": True,
            "user": {
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "aadhaar": user.aadhaar
            },
            "session": {
                "trustScore": trust_score,
                "riskLevel": risk_level,
                "ip": ip,
                "location": location,
                "deviceId": device_id,
                "token": str(refresh.access_token)
            }
        })

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'aadhaar': user.aadhaar,
        })
