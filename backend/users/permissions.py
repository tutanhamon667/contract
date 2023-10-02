from rest_framework import permissions


class IsUser(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if view.name.lower() == 'profile':
                if request.user.id == int(view.kwargs.get('pk')):
                    return True
                return False
            return True
        return False

    def has_object_permission(self, request, view, obj):
        return obj.author == request.user
