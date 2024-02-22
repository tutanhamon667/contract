from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
# from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from .fields import CustomizedBase64ImageField
from users.models.user import Member, Industry
from .serializers.serializers import DynamicFieldsModelSerializer

User = get_user_model()


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ('name',)


class GetCustomerProfileSerializer(DynamicFieldsModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    id = serializers.ReadOnlyField(source='user.id')
    account_login = serializers.ReadOnlyField(source='user.login')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    is_worker = serializers.ReadOnlyField(source='user.is_worker')
    is_customer = serializers.ReadOnlyField(source='user.is_customer')
    photo = CustomizedBase64ImageField()
    industry = IndustrySerializer(many=False, read_only=True)

    class Meta:
        model = Member
        fields = (
            'id', 'user', 'account_login', 'is_worker', 'is_customer', 'photo',
            'first_name', 'last_name', 'name', 'about', 'industry', 'web'
        )


class PostCustomerProfileSerializer(DynamicFieldsModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    id = serializers.ReadOnlyField(source='user.id')
    account_login = serializers.ReadOnlyField(source='user.login')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    is_worker = serializers.ReadOnlyField(source='user.is_worker')
    is_customer = serializers.ReadOnlyField(source='user.is_customer')
    photo = CustomizedBase64ImageField(required=False)
    industry = IndustrySerializer(many=False)

    class Meta:
        model = Member
        fields = (
            'id', 'user', 'account_login', 'is_worker', 'is_customer', 'photo',
            'first_name', 'last_name', 'name', 'about', 'industry', 'web'
        )

    def validate_user(self, user):
        user = self.context.get('request').user
        if (
            Member.objects.filter(user_id=user.id)
            and self.context.get('request').method == 'POST'
        ):
            raise ValidationError(
                'Профиль уже существует!'
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
        return Member.objects.create(
            industry=industry,
            **validated_data
        )

    def update(self, user, validated_data):
        profile = Member.objects.get(id=user.id)
        if 'industry' in self.initial_data:
            industry_data = validated_data.pop('industry')
            industry, status = Industry.objects.get_or_create(**industry_data)
            profile.industry = industry
        for field, value in validated_data.items():
            setattr(profile, field, value)
        profile.save()
        return profile
