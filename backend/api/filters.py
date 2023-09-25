from django_filters import rest_framework as filters

from orders.models import Category, Job


class JobsFilter(filters.FilterSet):
    min_budget = filters.NumberFilter(
        field_name='budget', lookup_expr='gte', label='от'
    )
    max_budget = filters.NumberFilter(
        field_name='budget', lookup_expr='lte', label='до'
    )
    category = filters.ModelMultipleChoiceFilter(
        field_name='category__slug',
        to_field_name='slug',
        queryset=Category.objects.all(),
        label='Категории',
    )

    class Meta:
        model = Job
        fields = []
