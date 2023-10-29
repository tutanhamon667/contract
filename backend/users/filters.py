from django_filters.rest_framework import FilterSet, NumberFilter, filters

from .models import Category, WorkerProfile


class FreelancerFilter(FilterSet):
    min_payrate = NumberFilter(
        field_name='payrate', lookup_expr='gte', label='от'
    )
    max_payrate = NumberFilter(
        field_name='payrate', lookup_expr='lte', label='до'
    )
    categories = filters.ModelMultipleChoiceFilter(
        field_name='categories__name',
        to_field_name='name',
        queryset=Category.objects.all(),
        label='Категории',
    )

    class Meta:
        model = WorkerProfile
        fields = ('categories',)
