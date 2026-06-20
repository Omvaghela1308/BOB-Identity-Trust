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
            # Medium Risk - Step-up password challenge required
            return Response({
                "success": True,
                "status": "step-up-required",
                "message": "Secondary password verification challenge required."
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
        password = request.data.get('password') or request.data.get('otp')
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

        # Verify password or allow test code '1234'
        is_valid = False
        if password == '1234':
            is_valid = True
        elif password and user.check_password(password):
            is_valid = True

        if not is_valid:
            return Response({"success": False, "message": "Invalid authorization password"}, status=status.HTTP_400_BAD_REQUEST)

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