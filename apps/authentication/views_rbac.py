from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.authentication.models import Users, StaffRole, SecurityAuditLog

class StaffRoleListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        roles = StaffRole.objects.all()
        data = [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "permissions": r.permissions,
                "is_system": r.is_system,
                "member_count": Users.objects.filter(is_staff=True).count(),
                "created_at": r.created_at.isoformat() if r.created_at else "",
            }
            for r in roles
        ]
        return Response(data)

    def post(self, request):
        data = request.data
        name = data.get("name", "").strip()
        if not name:
            return Response({"error": "Role name is required"}, status=status.HTTP_400_BAD_REQUEST)

        role = StaffRole.objects.create(
            name=name,
            description=data.get("description", ""),
            permissions=data.get("permissions", {}),
            is_system=data.get("is_system", False),
        )

        # Log action
        SecurityAuditLog.objects.create(
            actor_name="Super Admin",
            action_type="CREATE",
            module="RBAC",
            description=f"Created staff role: {name}",
            ip_address=request.META.get('REMOTE_ADDR'),
        )

        return Response({
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "permissions": role.permissions,
            "is_system": role.is_system,
            "member_count": 0,
        }, status=status.HTTP_201_CREATED)


class StaffRoleDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            role = StaffRole.objects.get(pk=pk)
        except StaffRole.DoesNotExist:
            return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)

        for key, val in request.data.items():
            if hasattr(role, key):
                setattr(role, key, val)
        role.save()

        # Log action
        SecurityAuditLog.objects.create(
            actor_name="Super Admin",
            action_type="UPDATE",
            module="RBAC",
            description=f"Updated permissions for role: {role.name}",
            ip_address=request.META.get('REMOTE_ADDR'),
        )

        return Response({
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "permissions": role.permissions,
            "is_system": role.is_system,
        })

    def delete(self, request, pk):
        try:
            role = StaffRole.objects.get(pk=pk)
            if role.is_system:
                return Response({"error": "Cannot delete system protected role"}, status=status.HTTP_400_BAD_REQUEST)
            name = role.name
            role.delete()

            SecurityAuditLog.objects.create(
                actor_name="Super Admin",
                action_type="DELETE",
                module="RBAC",
                description=f"Deleted staff role: {name}",
                ip_address=request.META.get('REMOTE_ADDR'),
            )

            return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
        except StaffRole.DoesNotExist:
            return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)


class StaffUserListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = Users.objects.filter(is_staff=True)
        data = [
            {
                "id": u.id,
                "full_name": f"{u.first_name} {u.last_name}".strip() or u.username,
                "email": u.email,
                "phone_number": u.phone_number or "N/A",
                "role_id": 1,
                "role_name": "Super Admin" if u.is_superuser else "Staff Member",
                "status": "ACTIVE" if u.is_active else "SUSPENDED",
                "joined_date": u.date_joined.isoformat() if u.date_joined else "",
            }
            for u in users
        ]
        return Response(data)

    def post(self, request):
        data = request.data
        username = data.get("username") or data.get("full_name", "").replace(" ", "_").lower()
        email = data.get("email", "")
        phone_number = data.get("phone_number", "")
        password = data.get("password", "Pass12345!")

        if not phone_number or not email:
            return Response({"error": "Email and Phone Number are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = Users.objects.create_user(
            phone_number=phone_number,
            email=email,
            username=username,
            password=password,
            is_staff=True,
            is_active=True,
        )

        SecurityAuditLog.objects.create(
            actor_name="Super Admin",
            action_type="CREATE",
            module="STAFF_MANAGEMENT",
            description=f"Onboarded new staff member: {user.username}",
            ip_address=request.META.get('REMOTE_ADDR'),
        )

        return Response({
            "id": user.id,
            "full_name": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "role_name": "Staff Member",
            "status": "ACTIVE",
        }, status=status.HTTP_201_CREATED)


class StaffUserDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            user = Users.objects.get(pk=pk, is_staff=True)
        except Users.DoesNotExist:
            return Response({"error": "Staff member not found"}, status=status.HTTP_404_NOT_FOUND)

        if "status" in request.data:
            new_status = request.data["status"]
            user.is_active = (new_status == "ACTIVE")
            user.save()

            SecurityAuditLog.objects.create(
                actor_name="Super Admin",
                action_type="STATUS_CHANGE",
                module="STAFF_MANAGEMENT",
                description=f"Toggled staff user {user.username} status to {new_status}",
                ip_address=request.META.get('REMOTE_ADDR'),
            )

        return Response({
            "id": user.id,
            "full_name": user.username,
            "status": "ACTIVE" if user.is_active else "SUSPENDED",
        })


class SecurityAuditLogListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        logs = SecurityAuditLog.objects.all()[:100]
        data = [
            {
                "id": log.id,
                "actor_name": log.actor_name,
                "action_type": log.action_type,
                "module": log.module,
                "description": log.description,
                "ip_address": log.ip_address or "127.0.0.1",
                "timestamp": log.timestamp.isoformat() if log.timestamp else "",
            }
            for log in logs
        ]
        return Response(data)
