from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from .models import CustomerProfile, Industry

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


class UserViewSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
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
