from django_filters import rest_framework as filters

from orders.models import Job, JobCategory


class JobFilter(filters.FilterSet):
    min_budget = filters.NumberFilter(
        field_name='budget', lookup_expr='gte', label='от'
    )
    max_budget = filters.NumberFilter(
        field_name='budget', lookup_expr='lte', label='до'
    )
    category = filters.ModelMultipleChoiceFilter(
        field_name='category__slug',
        to_field_name='slug',
        queryset=JobCategory.objects.all(),
        label='Категории',
    )

    class Meta:
        model = Job
        fields = []
