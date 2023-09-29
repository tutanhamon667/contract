from orders.models import Client
from rest_framework import serializers

from orders.models import Freelancer, Job, Stack


class ClientSerializer(serializers.ModelSerializer):
    """Заказчик."""
    class Meta:
        model = Client
        fields = ('user',)


class FreelancerSerializer(serializers.ModelSerializer):
    """Фрилансер."""
    class Meta:
        model = Freelancer
        fields = ('user',)


class StackSerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Stack
        fields = '__all__'


class JobListSerializer(serializers.ModelSerializer):
    """Получение списка заказов."""
    stack = StackSerializer(many=True)
    client = ClientSerializer()
    rating = serializers.IntegerField()

    class Meta:
        model = Job
        fields = ('id', 'title', 'category', 'stack', 'client', 'budget',
                  'description', 'rating')
