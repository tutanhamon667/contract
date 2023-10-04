from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from djoser import serializers as djoser_serializers
from rest_framework import serializers

from .fields import Base64ImageField
from .models import Activity, CustomerProfile, Industry, Stack, WorkerProfile

User = get_user_model()


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


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


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ('name',)


class GetCustomerProfileSerializer(DynamicFieldsModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    photo = Base64ImageField(required=False)
    industry = IndustrySerializer(many=False, read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ('user', 'photo', 'email', 'name', 'industry', 'web')


class PostCustomerProfileSerializer(DynamicFieldsModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    photo = Base64ImageField(required=False)
    industry = IndustrySerializer(many=False)

    class Meta:
        model = CustomerProfile
        fields = ('user', 'photo', 'email', 'name', 'industry', 'web')

    def validate_user(self, user):
        if CustomerProfile.objects.filter(user_id=user.id):
            raise ValidationError(
                'Профиль уже существует'
            )
        return user

    def validate_industry(self, industry):
        if not industry:
            raise ValidationError(
                'Укажите сферу деятельности компании'
            )
        return industry

    def create(self, validated_data):
        industry_data = validated_data.pop('industry')
        industry, status = Industry.objects.get_or_create(**industry_data)
        return CustomerProfile.objects.create(
            industry=industry,
            **validated_data
        )

    def update(self, user, validated_data):
        industry_data = validated_data.pop('industry')
        CustomerProfile.objects.filter(user=user).delete()
        industry, status = Industry.objects.get_or_create(**industry_data)
        return CustomerProfile.objects.create(
            user_id=user.id,
            industry=industry,
            **validated_data
        )
