from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from api.filters import JobFilter
from api.permissions import IsAuthorOrAdminOrReadOnly, IsFreelancer
from api.serializers import (JobCreateSerializer, JobListSerializer,
                             RespondedSerializer)
from orders.models import Job, Response

# TODO?:
# CategoriesViewSet
# StackViewSet
# ...


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobListSerializer
    pagination_class = PageNumberPagination
    permission_classes = (IsAuthorOrAdminOrReadOnly,)
    filter_backends = (DjangoFilterBackend,)
    filterset_class = JobFilter

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobListSerializer
        return JobCreateSerializer

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(methods=['post', 'delete'], detail=True,
            permission_classes=[IsAuthenticated, IsFreelancer])
    def response(self, request, pk=None):
        response_errors = {
            'POST': 'Вы отклинулись на это задание',
            'DELETE': 'Вы еще не откликнулись на это задание',
        }
        user = self.request.user
        job = get_object_or_404(Job, pk=pk)
        if not user.freelancer:
            return Response(
                {'errors': 'Вы не являетесь фрилансером'},
                status=status.HTTP_403_FORBIDDEN
            )
        in_response = Response.objects.filter(user=user, job=job)
        if request.method == 'POST' and not in_response:
            response = Response.objects.create(user=user, job=job)
            serializer = RespondedSerializer(response.job)
            return Response(data=serializer.data,
                            status=status.HTTP_201_CREATED)
        if request.method == 'DELETE' and in_response:
            in_response.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        response = {'errors': response_errors[request.method]}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)
