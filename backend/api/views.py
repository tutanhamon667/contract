from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from orders.models import Job, JobCategory, JobResponse

from .filters import JobFilter
from .mixins import CreateListDestroytViewSet
from .permissions import IsAdminOrReadOnly, IsCustomerOrReadOnly, IsFreelancer
from .serializers import (JobCategorySerializer, JobCreateSerializer,
                          JobListSerializer, JobResponseSerializer,
                          RespondedSerializer)


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
    search_fields = ('name',)
    pagination_class = PageNumberPagination
    filter_backends = (SearchFilter, DjangoFilterBackend,)
    filterset_class = JobFilter

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobListSerializer
        if self.action == 'response':
            return JobResponseSerializer
        return JobCreateSerializer

    def get_permissions(self):
        if self.action in ['create', 'update']:
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
            serializer = RespondedSerializer(response.job)
            return Response(
                data=serializer.data,
                status=status.HTTP_201_CREATED
            )
        if request.method == 'DELETE' and in_projects:
            in_projects.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        response = {'errors': response_errors[request.method]}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)
