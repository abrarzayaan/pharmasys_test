from rest_framework.permissions import BasePermission
from apps.authentication.models import UserRole

class IsRoleUser(BasePermission):
    """
    টোকেন এবং ডাটাবেজ থেকে ইউজারের রোল চেক করার গ্লোবাল পারমিশন ক্লাস।
    """
    def __init__(self, allowed_role):
        self.allowed_role = allowed_role

    def has_permission(self, request, view):
        # ইউজার লগইন করা আছে কিনা চেক
        if not request.user or not request.user.is_authenticated:
            return False
        
        # ডাটাবেজ থেকে রোল ভেরিফাই করা
        try:
            user_role = UserRole.objects.get(user=request.user).role.name
            return user_role == self.allowed_role
        except UserRole.DoesNotExist:
            return False

# নির্দিষ্ট রোল ভিত্তিক পারমিশন ক্লাস
class IsConsumer(IsRoleUser):
    def __init__(self):
        super().__init__('consumer')

class IsVendor(IsRoleUser):
    def __init__(self):
        super().__init__('vendor')

class IsRider(IsRoleUser):
    def __init__(self):
        super().__init__('rider')