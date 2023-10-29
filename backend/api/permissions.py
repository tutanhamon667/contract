from rest_framework import permissions

from chat.models import Chat


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


''' Удалить если ничего не сломается
class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, _):
        return (
            request.user.is_authenticated
            and request.user.is_customer
        )


class IsCustomerOrIsAdmin(permissions.BasePermission):
    def has_permission(self, request, _):
        return (
            request.user.is_authenticated
            and (request.user.is_customer or request.user.is_admin)
        )
'''


class IsCustomerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, _):
        return (request.method in permissions.SAFE_METHODS
                or request.user.is_authenticated)

    def has_object_permission(self, request, _, obj):
        return (request.method in permissions.SAFE_METHODS
                or request.user.is_admin
                or request.user.is_customer
                or obj.client == request.user)


class ChatPermission(permissions.BasePermission):
    """
    Для чатов разрешается:
    - заказчик или фрилансер могут получать
    список только своих чатов;
    - чат может создаваться как с привязкой к заданию (job_id),
    так и без него
    - создавать чат по заданию может только автор
    задания;
    - администратор может создавать и удалять;
    - все действия необходимо выполнять авторизованным.
    """
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if request.method == 'GET':
                return True
            if request.method == 'POST':
                job_id = request.data.get('job_id')
                if job_id and request.user.is_customer:
                    customer = request.user.customerprofile
                    if customer.jobs.filter(id=job_id).exists():
                        return True
                if not job_id and request.user.is_customer:
                    return request.user.customerprofile
            elif request.user.is_superuser:
                return True
        return False


class MessagePermission(permissions.BasePermission):
    """
    Для сообщений разрешается:
    - заказчик или фрилансер могут получать
    список только своих сообщений;
    - писать сообщения могут только в свои чаты;
    - администратор может создавать и удалять;
    - все действия необходимо выполнять авторизованным.
    """
    def has_permission(self, request, view):
        chat_id = view.kwargs.get('chat_id')
        user = request.user
        if user.is_superuser:
            return True
        if user.is_worker:
            return Chat.objects.filter(pk=chat_id,
                                       freelancer=user.workerprofile).exists()
        if user.is_customer:
            return Chat.objects.filter(pk=chat_id,
                                       customer=user.customerprofile).exists()
        return False
