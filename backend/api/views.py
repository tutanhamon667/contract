from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from api.filters import JobFilter
from api.mixins import CreateListDestroytViewSet
from api.permissions import (IsAdminOrReadOnly, IsCustomerOrReadOnly,
                             IsFreelancer)
from api.serializers import (CategorySerializer, JobCreateSerializer,
                             JobListSerializer, RespondedSerializer,
                             ResponseSerializer)
from orders.models import Category, Job
from orders.models import Response as Responses


class CategoryViewSet(CreateListDestroytViewSet):
    """Специализации."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    pagination_class = None


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    search_fields = ('name',)
    pagination_class = PageNumberPagination
    filter_backends = (SearchFilter, DjangoFilterBackend,)
    filterset_class = JobFilter

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobListSerializer
        if self.action == 'response':
            return ResponseSerializer
        return JobCreateSerializer

    def get_permissions(self):
        if self.action in ['create', 'update']:
            permission_classes = (IsCustomerOrReadOnly,)
        if self.action == 'response':
            permission_classes = (IsFreelancer,)
        else:
            permission_classes = (IsAdminOrReadOnly,)
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(client_id=self.request.user.id)

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
        in_projects = Responses.objects.filter(
            freelancer=freelancer,
            job=job
        )
        if request.method == 'POST' and not in_projects:
            response = Responses.objects.create(
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

    '''
    # Варианты кода для создания отклика

    @action(detail=True, methods=["post", "delete"],
            permission_classes=[IsAuthenticated, IsFreelancer])
    def response_new(self, request, pk=None):
        response_errors = {
            'POST': 'Рецепт уже добавлен в список покупок',
            'DELETE': 'Рецепт в корзине отсутствует',
        }
        job = get_object_or_404(Job, pk=pk)
        user = self.request.user
        in_projects = Response.objects.filter(user=user, job=job)

        if request.method == 'POST' and not in_projects:
            serializer = ResponseSerializer(data={'freelancer': user.id,
                                                  'job': job.id})
            if serializer.is_valid():
                serializer.save()
                return Response(
                    data=serializer.data,
                    status=status.HTTP_201_CREATED
                )

            return Response(
                data=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.method == 'DELETE' and in_projects:
            in_projects.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        response = {'errors': response_errors[request.method]}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)



    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=(IsAuthenticated,),
        pagination_class=None,
    )
    def response_new2(self, request, pk):
        job = get_object_or_404(Job, id=pk)
        serializer = ResponseSerializer(
            data={'user': request.user.id, 'recipe': job.id},
            context={'request': request}
        )
        if request.method == 'post':
            serializer.is_valid(raise_exception=True)
            serializer.save(job=job, user=request.user)
            serializer = RespondedSerializer(job)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        response = get_object_or_404(
            Response, job=job, user=request.user
        )
        self.perform_destroy(response)
        return Response(
            f'Отклик на задание {job} удален.',
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=True, permission_classes=(IsAuthenticated,))
    def response_new3(self, request, pk: int) -> Response:
        """Добавляет/удалет задание из "Проектов"`.

        Вызов метода через url: */recipe/<int:pk>/favorite/.

        Args:
            request (WSGIRequest): Объект запроса.
            pk (int):
                id рецепта, который нужно добавить/удалить из `избранного`.

        Returns:
            Responce: Статус подтверждающий/отклоняющий действие.
        """

    @response_new3.mapping.post
    def job_to_project(
        self, request, pk: int
    ) -> Response:
        self.link_model = Response
        return self._create_relation(pk)

    @response_new3.mapping.delete
    def remove_job_from_project(
        self, request, pk: int
    ) -> Response:
        self.link_model = Response
        return self._delete_relation(Q(recipe__id=pk))
    '''
