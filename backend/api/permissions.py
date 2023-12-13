from rest_framework import permissions

from chat.models import Chat
from orders.models import Job


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

    def has_object_permission(self, request, _, obj):
        return request.user.is_authenticated


class IsFreelancer(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if view.action in ['create', 'delete']:
                return request.user.is_worker
            return True
        return False


class IsCustomerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, _):
        return (request.method in permissions.SAFE_METHODS
                or (request.user.is_authenticated
                    and (request.user.is_admin
                         or request.user.is_customer
                         or request.user.is_worker)
                    )
                )

    def has_object_permission(self, request, _, obj):
        return (request.user.is_customer
                and obj.client == request.user.customerprofile)


class IsJobAuthor(permissions.BasePermission):
    """
    Проверка для списка откликов на задание,
    на его доступность только автору задания.
    """
    def has_permission(self, request, view):
        # Проверяем, является ли текущий пользователь автором задания
        if (request.user.is_authenticated
                and (request.user.is_admin or request.user.is_customer)):
            job_id = view.kwargs.get('pk')
            job = Job.objects.get(pk=job_id)
            return job.client == request.user.customerprofile
        return False


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
    def has_permission(self, request, _):
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
