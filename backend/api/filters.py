from django_filters.rest_framework import FilterSet, NumberFilter, filters
from django_filters.widgets import BooleanWidget

from orders.models import Job, JobCategory


class JobFilter(FilterSet):
    min_budget = NumberFilter(
        field_name='budget', lookup_expr='gte', label='от'
    )
    max_budget = NumberFilter(
        field_name='budget', lookup_expr='lte', label='до'
    )
    category = filters.ModelMultipleChoiceFilter(
        field_name='category__slug',
        to_field_name='slug',
        queryset=JobCategory.objects.all(),
        label='Категории',
    )
    client = filters.NumberFilter(
        field_name='client_id',
        label='тип поля - integer: id заказчика для отображения его заданий',
        lookup_expr='exact',
    )
    is_responded = filters.BooleanFilter(
        method='get_is_responded',
        label='тип поля boolean: 1 - c откликами фрилансера, 0 - без фильтра',
        help_text='',
        widget=BooleanWidget(),
    )

    def get_is_responded(self, queryset, _, value):
        if value:
            return queryset.filter(
                responses__freelancer__user=self.request.user
            )
        return Job.objects.all()

    class Meta:
        model = Job
        fields = ('category', 'client',)
