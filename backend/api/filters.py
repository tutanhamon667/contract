from decimal import Decimal, DecimalException

from django.core.exceptions import ValidationError
from django.db.models import IntegerField, Q
from django.db.models.functions import Cast
from django_filters.rest_framework import FilterSet, NumberFilter, filters
from django_filters.widgets import BooleanWidget

from orders.models import Job, JobCategory, JobResponse
from taski.settings import ASK_MSG


class JobFilter(FilterSet):
    min_budget = NumberFilter(
        field_name='budget',
        lookup_expr='gte',
        method='filter_min_budget',
        label='от'
    )

    max_budget = NumberFilter(
        field_name='budget',
        lookup_expr='lte',
        method='filter_max_budget',
        label='до'
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

    def filter_min_budget(self, queryset, name, value):
        return self.filter_budget(queryset, value, 'gte')

    def filter_max_budget(self, queryset, name, value):
        return self.filter_budget(queryset, value, 'lte')

    def filter_budget(self, queryset, value, lookup_expr):
        try:
            queryset = queryset.exclude(budget=ASK_MSG).annotate(
                int_budget=Cast('budget', IntegerField())
            ).filter(**{f'int_budget__{lookup_expr}': int(value)})
        except (ValueError, ValidationError):
            pass  # Обработка ошибки преобразования в int

        return queryset

    def get_is_responded(self, queryset, _, value):
        if value:
            return queryset.filter(
                responses__freelancer__user=self.request.user
            )
        return Job.objects.all()

    class Meta:
        model = Job
        fields = ('category', 'client', 'min_budget', 'max_budget')


class JobResponsesFilter(FilterSet):
    min_payrate = NumberFilter(
        field_name='freelancer__payrate', lookup_expr='gte', label='от'
    )
    max_payrate = NumberFilter(
        field_name='freelancer__payrate', lookup_expr='lte', label='до'
    )

    class Meta:
        model = JobResponse
        fields = []
