from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet

from api.filters import JobsFilter
from api.permissions import IsAdminOrReadOnly
from api.serializers import JobListSerializer
from orders.models import Job

# TODO:
# FreelancersViewSet
# CategoriesViewSet
# StackViewSet
# ...


class JobsViewSet(ModelViewSet):
    """
    GET запрос получения списка заказов.
    """
    queryset = Job.objects.all().order_by('title')
    serializer_class = JobListSerializer
    permission_classes = (IsAdminOrReadOnly,)
    pagination_class = PageNumberPagination
    filterset_class = JobsFilter
    filter_backends = (DjangoFilterBackend,)
