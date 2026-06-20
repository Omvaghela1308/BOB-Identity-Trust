from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.models import User
from transactions.models import Transaction, FraudCase
from security.models import SecurityAlert, LoginHistory
from django.utils import timezone

class AdminMetricsView(APIView):
    def get(self, request):
        # Retrieve actual counts from the database
        db_blocked = Transaction.objects.filter(status='BLOCKED').count()
        db_alerts = SecurityAlert.objects.count()
        db_fraud = FraudCase.objects.count()

        blocked_ato = db_blocked
        insider_alerts = db_alerts
        kyc_fraud = db_fraud

        # Generate actual dynamic hourly telemetry charts for the last 6 hours
        import datetime
        now = timezone.now()
        charts = []
        
        # No seed/dummy values: charts show actual database metrics only
        base_ato = [0, 0, 0, 0, 0, 0]
        base_insider = [0, 0, 0, 0, 0, 0]
        
        for i in range(5, -1, -1):
            time_slot = now - datetime.timedelta(hours=i)
            hour_str = time_slot.strftime("%H:00")
            
            # Query actual occurrences in this hour slot
            start_time = time_slot.replace(minute=0, second=0, microsecond=0)
            end_time = start_time + datetime.timedelta(hours=1)
            
            slot_blocked = Transaction.objects.filter(
                status='BLOCKED',
                created_at__gte=start_time,
                created_at__lt=end_time
            ).count()
            
            slot_alerts = SecurityAlert.objects.filter(
                created_at__gte=start_time,
                created_at__lt=end_time
            ).count()
            
            # Combine baseline seed with actual database occurrences
            charts.append({
                "hour": hour_str,
                "ATO": base_ato[5 - i] + slot_blocked,
                "Insider": base_insider[5 - i] + slot_alerts
            })

        # Gather recent log events
        events = []

        # 1. Gather transactions
        transactions = Transaction.objects.select_related('user').order_by('-created_at')[:10]
        for tx in transactions:
            risk = 'LOW'
            if tx.risk_score >= 80:
                risk = 'HIGH'
            elif tx.risk_score >= 30:
                risk = 'MEDIUM'
                
            status_text = 'Success'
            if tx.status == 'BLOCKED':
                status_text = 'Blocked'
            elif tx.status == 'PENDING':
                status_text = 'Step-up MFA Sent'

            events.append({
                "timestamp": tx.created_at.isoformat(),
                "event": f"Fund Transfer: ₹{tx.amount:,.2f} to {tx.receiver}",
                "risk": risk,
                "user": tx.user.email if tx.user.email else tx.user.username,
                "status": status_text
            })

        # 2. Gather login history
        logins = LoginHistory.objects.select_related('user').order_by('-login_time')[:10]
        for log in logins:
            risk = 'LOW'
            if log.risk_score >= 70:
                risk = 'HIGH'
            elif log.risk_score >= 30:
                risk = 'MEDIUM'

            events.append({
                "timestamp": log.login_time.isoformat(),
                "event": f"Identity Portal Login from {log.location} ({log.ip})",
                "risk": risk,
                "user": log.user.email if log.user.email else log.user.username,
                "status": log.status.capitalize()
            })

        # 3. Gather security alerts
        alerts = SecurityAlert.objects.select_related('user').order_by('-created_at')[:10]
        for alert in alerts:
            events.append({
                "timestamp": alert.created_at.isoformat(),
                "event": f"Security Alert: {alert.alert_type} - {alert.description}",
                "risk": "HIGH",
                "user": alert.user.email if alert.user.email else alert.user.username,
                "status": "Blocked"
            })

        # Sort logs by timestamp descending
        events.sort(key=lambda x: x['timestamp'], reverse=True)
        # Keep latest 15 logs
        logs = events[:15]

        # In case logs list is empty (no logins/txs yet), create a default baseline
        if not logs:
            logs = [
                {
                    "timestamp": timezone.now().isoformat(),
                    "event": "Security Ops Engine Active",
                    "risk": "LOW",
                    "user": "system@bankofbaroda.com",
                    "status": "Success"
                }
            ]

        return Response({
            "stats": {
                "blockedATO": blocked_ato,
                "insiderAccessAlerts": insider_alerts,
                "kycFraudPreventions": kyc_fraud
            },
            "charts": charts,
            "logs": logs
        })

class AdminUsersSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.email != 'bob.security11@gmail.com':
            return Response({"success": False, "message": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all().order_by('-created_at')
        users_data = []
        for u in users:
            txs = Transaction.objects.filter(user=u).order_by('-created_at')
            txs_list = []
            for tx in txs:
                txs_list.append({
                    "transaction_id": tx.transaction_id,
                    "transaction_type": tx.transaction_type,
                    "amount": float(tx.amount),
                    "receiver": tx.receiver,
                    "risk_score": tx.risk_score,
                    "status": tx.status,
                    "created_at": tx.created_at.isoformat()
                })

            # Format chart data (chronological order)
            # Recharts requires at least 2 data points
            chart_data = []
            txs_asc = list(txs.order_by('created_at'))
            if len(txs_asc) == 0:
                chart_data = [
                    {"date": "Baseline", "amount": 0, "risk_score": 0},
                    {"date": "Current", "amount": 0, "risk_score": 0}
                ]
            elif len(txs_asc) == 1:
                chart_data = [
                    {"date": "Baseline", "amount": 0, "risk_score": 0},
                    {"date": txs_asc[0].created_at.strftime("%H:%M (%d/%m)"), "amount": float(txs_asc[0].amount), "risk_score": txs_asc[0].risk_score}
                ]
            else:
                for tx in txs_asc:
                    chart_data.append({
                        "date": tx.created_at.strftime("%H:%M (%d/%m)"),
                        "amount": float(tx.amount),
                        "risk_score": tx.risk_score
                    })

            users_data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "phone": u.phone or "N/A",
                "aadhaar": u.aadhaar or "N/A",
                "created_at": u.created_at.isoformat() if u.created_at else u.date_joined.isoformat(),
                "transactions": txs_list,
                "chart_data": chart_data
            })

        return Response({
            "success": True,
            "users": users_data
        })