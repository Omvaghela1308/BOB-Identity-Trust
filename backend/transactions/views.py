import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from risk import state
from security.models import SecurityAlert, OTPVerification
from .models import Transaction, FraudCase

class TransferView(APIView):
    def post(self, request):
        email = request.data.get('email')
        amount_str = request.data.get('amount', 0)
        recipient = request.data.get('recipient')

        try:
            amount = float(amount_str)
        except ValueError:
            return Response({"success": False, "message": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"success": False, "message": "Amount must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        if not recipient:
            return Response({"success": False, "message": "Recipient is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve user
        user = User.objects.filter(email=email).first()
        if not user:
            username = email.split('@')[0]
            user = User.objects.filter(username=username).first()
            if not user:
                return Response({"success": False, "message": "Sender identity not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Inspect simulated risk vector
        risk_vector = getattr(state, 'ACTIVE_RISK_VECTOR', 'Normal')

        if risk_vector == 'Normal':
            # Auto-approved transaction (Low Risk)
            transaction = Transaction.objects.create(
                user=user,
                transaction_id=str(uuid.uuid4()),
                transaction_type="TRANSFER",
                amount=amount,
                receiver=recipient,
                risk_score=10,
                status="SUCCESS"
            )
            return Response({
                "success": True,
                "status": "completed",
                "message": f"Transfer of ₹{amount:,.2f} to {recipient} completed successfully."
            })

        elif risk_vector == 'NewDevice':
            # Medium Risk - Step-up challenge required
            # Generate and save step-up OTP
            otp = str(random_otp := 1234) # Accept test OTP 1234 as mentioned in UI
            OTPVerification.objects.create(
                user=user,
                otp=str(otp)
            )

            # Send step-up OTP to user email asynchronously
            from security.otp_sender import send_mail_async
            send_mail_async(
                "Transaction Step-up Verification OTP",
                f"Your Bank of Baroda security step-up verification code is {otp}. This code is required to authorize the transfer of ₹{amount:,.2f} to {recipient}.",
                [user.email]
            )

            return Response({
                "success": True,
                "status": "step-up-required",
                "message": "Secondary MFA authentication challenge required."
            })

        else: # ImpossibleTravel
            # Critical Risk - Blocked transaction, create fraud case and security alert
            transaction = Transaction.objects.create(
                user=user,
                transaction_id=str(uuid.uuid4()),
                transaction_type="TRANSFER",
                amount=amount,
                receiver=recipient,
                risk_score=95,
                status="BLOCKED"
            )
            # Create Fraud Case
            FraudCase.objects.create(
                transaction=transaction,
                fraud_score=95,
                reason="Impossible Travel Detected (Mumbai -> London session divergence)"
            )
            # Create Security Alert
            SecurityAlert.objects.create(
                user=user,
                alert_type="Account Takeover Attempt",
                description=f"Transaction of ₹{amount:,.2f} to {recipient} blocked due to critical risk anomaly (Impossible Travel).",
                resolved=False
            )
            return Response({
                "success": False,
                "status": "blocked",
                "message": "Transaction rejected: Critical risk threat signature intercepted (Impossible Travel)."
            })

class VerifyStepUpView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        amount_str = request.data.get('amount', 0)
        recipient = request.data.get('recipient')

        try:
            amount = float(amount_str)
        except ValueError:
            return Response({"success": False, "message": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

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
            if otp_record and not otp_record.is_expired():
                otp_record.is_verified = True
                otp_record.save()
                otp_valid = True

        if not otp_valid:
            return Response({"success": False, "message": "Invalid transaction verification OTP code"}, status=status.HTTP_400_BAD_REQUEST)

        # Create successful transaction (MFA verified)
        transaction = Transaction.objects.create(
            user=user,
            transaction_id=str(uuid.uuid4()),
            transaction_type="TRANSFER",
            amount=amount,
            receiver=recipient,
            risk_score=40, # elevated but verified
            status="SUCCESS"
        )

        return Response({
            "success": True,
            "message": f"Transfer of ₹{amount:,.2f} to {recipient} authorized via MFA."
        })