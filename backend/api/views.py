from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from api.filters import JobFilter, JobResponsesFilter
from api.mixins import CreateListDestroytViewSet, CreateListViewSet
from api.permissions import (ChatPermission, IsAdminOrReadOnly,
                             IsCustomerOrReadOnly, IsFreelancer, IsJobAuthor,
                             MessagePermission)
from api.serializers import (ChatCreateSerializer, ChatReadSerializer,
                             JobCategorySerializer, JobCreateSerializer,
                             JobListSerializer, JobResponseSerializer,
                             MessageSerializer, ResponseFreelancersSerializer)
from chat.models import Chat, Message
from orders.models import Job, JobCategory, JobResponse
from taski.settings import OTHER_TASK_CHAT_ERR, SELECTED_FOR_JOB_MSG
from users.models import WorkerProfile


class JobCategoryViewSet(CreateListDestroytViewSet):
    """Специализации."""
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    pagination_class = None


class JobViewSet(ModelViewSet):
    """
    Представление списка заданий.
    Отображение списка заказов принятых фрилансером
    используется фильтр is_responded:
    1 - для отображения заданий на которые откликнулись
    0 - по умполчанию все задания
    Отображение списка заказов заказчика
    используется фильтр client.
    """
    queryset = Job.objects.all()
    pagination_class = PageNumberPagination
    filter_backends = (SearchFilter, DjangoFilterBackend,)
    filterset_class = JobFilter
    search_fields = ['title', 'description']

    def get_serializer_class(self):
        if self.action == 'response':
            return JobResponseSerializer
        if self.action == 'offers':
            return ResponseFreelancersSerializer
        if self.request.method == 'GET':
            return JobListSerializer
        return JobCreateSerializer

    def get_permissions(self):
        if self.action == 'offers':
            permission_classes = (IsJobAuthor,)
        elif self.action in ['create', 'update']:
            permission_classes = (IsCustomerOrReadOnly,)
        elif self.action == 'response':
            permission_classes = (IsFreelancer,)
        else:
            permission_classes = (IsAdminOrReadOnly,)
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user.customerprofile)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post", "delete"],
            permission_classes=(IsFreelancer,))
    def response(self, request, pk=None):
        """
        Эндпоинт для отправки отклика на задание фрилансером.
        В теле запроса ничего передавать не требуется.
        Доступен авторизованному пользователю, зарегистированному фрилансером.
        """
        response_errors = {
            'POST': 'Отклик уже отправлен',
            'DELETE': 'Вы не отправляли или уже удалили отклик',
        }
        job = get_object_or_404(Job, pk=pk)
        freelancer = self.request.user.workerprofile
        in_projects = JobResponse.objects.filter(
            freelancer=freelancer,
            job=job
        )
        if request.method == 'POST' and not in_projects:
            response = JobResponse.objects.create(
                freelancer=freelancer,
                job=job
            )
            serializer = JobResponseSerializer(response)
            return Response(
                data=serializer.data,
                status=status.HTTP_201_CREATED
            )
        if request.method == 'DELETE' and in_projects:
            in_projects.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        response = {'errors': response_errors[request.method]}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"],
            permission_classes=(IsJobAuthor,),
            pagination_class=PageNumberPagination,
            filter_backends=(SearchFilter, DjangoFilterBackend,),
            filterset_class=JobResponsesFilter
            )
    def offers(self, _, pk=None):
        """
        Отображение списка откликов (фрилансеров).
        Доступно только автору задания.
        Представлен с пагинацей.
        Есть фильтр по ставке: min_payrate и max_payrate.
        """
        job = get_object_or_404(Job, pk=pk)
        responses = job.responses.all().order_by('id')
        filtered_responses = self.filter_queryset(responses)

        page = self.paginate_queryset(filtered_responses)
        if page is not None:
            serializer = ResponseFreelancersSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ResponseFreelancersSerializer(filtered_responses,
                                                   many=True)
        return Response(serializer.data)


class ChatViewSet(CreateListViewSet):
    """ Чаты.
    Для чатов разрешается:
    - заказчик или фрилансер могут получать
    список только своих чатов;
    - чат может создаваться как без привязки к заданию
    так и с привязкой к заданию (для этого указать job_id в теле запроса)
    - создавать чат по заданию может только автор
    задания;
    - администратор может создавать и удалять;
    - все действия необходимо выполнять авторизованным.

    Создание чата с отправкой сообщения:
    - для создания чата используется профиль заказчика
    - для создания сообщения - общий профиль пользователя
    - поле job_id не обязательное для чатов без привязки к заданию
    - поле  message_text не обязательное - заменяется на дефолтное
    """
    queryset = Chat.objects.all()
    permission_classes = (ChatPermission,)
    filter_backends = (SearchFilter,)
    search_fields = ['@title']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatCreateSerializer
        return ChatReadSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Chat.objects.all()
        if user.is_worker:
            return Chat.objects.filter(freelancer=user.workerprofile)
        if user.is_customer:
            return Chat.objects.filter(customer=user.customerprofile)
        return Message.objects.none()

    def perform_create(self, serializer):
        """
        Задание может создвать с привязкой к заданию.
        """
        customer = self.request.user.customerprofile
        freelancer_id = self.request.data.get('freelancer')
        freelancer = get_object_or_404(WorkerProfile, pk=freelancer_id)
        job_id = self.request.data.get('job_id')
        message_text = self.request.data.get('message_text',
                                             SELECTED_FOR_JOB_MSG)
        if job_id:
            job = get_object_or_404(Job, pk=job_id)
            if customer == job.client:
                chat = serializer.save(customer=customer,
                                       freelancer=freelancer,
                                       title=job.title,
                                       job=job)
            else:
                return Response({'detail': OTHER_TASK_CHAT_ERR},
                                status=status.HTTP_403_FORBIDDEN)
        else:
            chat = serializer.save(customer=customer,
                                   freelancer=freelancer,
                                   title='Без задания')
        try:
            Message.objects.create(chat=chat,
                                   content=message_text,
                                   sender=self.request.user)
        except Exception as e:
            return Response({'detail': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_201_CREATED)


class MessageViewSet(CreateListViewSet):
    """ Сообщения в чатах.
    Для сообщений разрешается:
    - заказчик или фрилансер могут получать
    список только своих сообщений;
    - писать сообщения могут только в свои чаты;
    - администратор может создавать и удалять;
    - все действия необходимо выполнять авторизованным.
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [MessagePermission]
    filter_backends = (SearchFilter,)
    search_fields = ['@content']

    def get_queryset(self):
        chat_id = self.kwargs.get('chat_id')
        user = self.request.user
        if user.is_superuser:
            return Message.objects.all()
        if user.is_worker:
            chats = Chat.objects.filter(freelancer=user.workerprofile)
        if user.is_customer:
            chats = Chat.objects.filter(customer=user.customerprofile)
        return Message.objects.filter(chat__in=chats, chat_id=chat_id)

    def perform_create(self, serializer):
        sender = self.request.user
        chat_id = self.kwargs.get('chat_id')
        chat = Chat.objects.get(pk=chat_id)
        serializer.save(sender=sender, chat=chat)
