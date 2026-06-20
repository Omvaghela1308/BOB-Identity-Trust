from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import state

class SimulateRiskView(APIView):
    def post(self, request):
        email = request.data.get('email')
        risk_vector = request.data.get('riskVector', 'Normal')
        
        if email:
            if not hasattr(state, 'ACTIVE_RISK_VECTORS'):
                state.ACTIVE_RISK_VECTORS = {}
            state.ACTIVE_RISK_VECTORS[email] = risk_vector
        else:
            state.ACTIVE_RISK_VECTOR = risk_vector

        # Base responses for simulation
        if risk_vector == 'Normal':
            trust_score = 98
            risk_level = 'LOW'
            session_ip = '127.0.0.1'
            session_location = 'Mumbai, India'
            session_device = 'DEV-BOB-9842'
        elif risk_vector == 'NewDevice':
            trust_score = 65
            risk_level = 'MEDIUM'
            session_ip = '192.168.1.150'
            session_location = 'Bangalore, India'
            session_device = 'DEV-BOB-ANOMALY-99'
        elif risk_vector == 'ImpossibleTravel':
            trust_score = 24
            risk_level = 'HIGH'
            session_ip = '85.25.43.11'
            session_location = 'London, UK'
            session_device = 'DEV-BOB-ANOMALY-99'
        else:
            return Response({"success": False, "message": "Invalid risk vector"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "trustScore": trust_score,
            "riskLevel": risk_level,
            "session": {
                "ip": session_ip,
                "location": session_location,
                "deviceId": session_device
            }
        })

