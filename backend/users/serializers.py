from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from djoser import serializers as djoser_serializers
from rest_framework import serializers

from .fields import Base64ImageField
from .models import Activity, CustomerProfile, Member, Stack, WorkerProfile

User = get_user_model()


class UserCreateSerializer(
        djoser_serializers.UserCreatePasswordRetypeSerializer
):
    is_customer = serializers.BooleanField(default=False)
    is_worker = serializers.BooleanField(default=False)

    class Meta(djoser_serializers.UserCreatePasswordRetypeSerializer.Meta):
        fields = (
            'is_customer',
            'is_worker',
            'email',
            'first_name',
            'last_name',
            'password',
        )

    def validate(self, data):
        is_customer = data.get('is_customer')
        is_worker = data.get('is_worker')
        if is_customer == is_worker:
            raise serializers.ValidationError(
                'Нужно выбрать "Фрилансер" или "Заказчик'
            )
        return super().validate(data)


class NewEmailSerializer(djoser_serializers.SetUsernameRetypeSerializer):
    pass


class SetPasswordSerializer(djoser_serializers.SetPasswordRetypeSerializer):
    pass


class SendEmailResetSerializer(djoser_serializers.SendEmailResetSerializer):
    pass


class PasswordResetConfirmSerializer(
    djoser_serializers.PasswordResetConfirmRetypeSerializer
):
    pass


class UserViewSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name')


class WorkerProfileSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    photo = Base64ImageField(required=False)

    class Meta:
        model = WorkerProfile
        fields = '__all__'


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    photo = Base64ImageField(required=False)

    class Meta:
        model = CustomerProfile
        fields = ('user', 'photo', 'name', 'industry', 'web')
