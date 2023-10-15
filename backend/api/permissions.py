from rest_framework import permissions


class IsAuthorOrAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, _view):
        return (request.method in permissions.SAFE_METHODS
                or request.user.is_authenticated)

    def has_object_permission(self, request, _view, obj):
        return (request.method in permissions.SAFE_METHODS
                or request.user.is_admin
                or obj.author == request.user)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, _):
        return (
            request.method in permissions.SAFE_METHODS
            or request.user.is_authenticated
            and (
                request.user.is_admin
                or request.user.is_superuser
            )
        )


class IsFreelancer(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if view.action in ['create', 'delete']:
                return request.user.is_worker
            return True
        return False


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, _):
        return (
            request.user.is_authenticated
            and request.user.is_customer
        )


class IsCustomerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, _):
        return (request.method in permissions.SAFE_METHODS
                or request.user.is_authenticated)

    def has_object_permission(self, request, _, obj):
        return (request.method in permissions.SAFE_METHODS
                or request.user.is_admin
                or request.user.is_customer
                or obj.client == request.user)


'''
class IsCustomerOrReadOnly_old(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if view.action == 'create':
                return request.user.is_customer
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and request.user.is_worker:
            return view.action in ['retrieve', 'list']
        return True
'''
