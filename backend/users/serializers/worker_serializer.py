from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
# from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from users.fields import CustomizedBase64ImageField
from users.models.user import ( Specialisation, Contact,
                          Industry, Member, Resume)
from users.serializers.serializers import DynamicFieldsModelSerializer

User = get_user_model()


class WorkerField(serializers.RelatedField):
    def to_representation(self, value):
        return {
            'first_name': value.first_name,
            'last_name': value.last_name
        }

    def to_internal_value(self, data):
        user = self.context.get('request').user
        if not getattr(self.root, 'partial'):
            if 'first_name' not in data:
                raise ValidationError('\'first_name\' обязательное поле')
            if 'last_name' not in data:
                raise ValidationError('\'last_name\' обязательное поле')
        for field, value in data.items():
            setattr(user, field, value)
        user.save()
        return user


class GetWorkerProfileSerializer(DynamicFieldsModelSerializer):
    user = WorkerField(queryset=User.objects.all())
    id = serializers.ReadOnlyField(source='user.id')
    is_worker = serializers.ReadOnlyField(source='user.is_worker')
    is_customer = serializers.ReadOnlyField(source='user.is_customer')
    photo = CustomizedBase64ImageField(required=False)
    account_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Member
        fields = '__all__'


class WorkerViewSerializer(serializers.ModelSerializer):
    user = WorkerField(queryset=User.objects.all())
    id = serializers.ReadOnlyField(source='user.id')
    photo = CustomizedBase64ImageField(required=False)

    class Meta:
        model = Member
        fields = (
            'id',  'photo'
        )


class PostWorkerProfileSerializer(DynamicFieldsModelSerializer):
    photo = CustomizedBase64ImageField(required=False)
    id = serializers.ReadOnlyField(source='user.id')
    is_worker = serializers.ReadOnlyField(source='user.is_worker')
    is_customer = serializers.ReadOnlyField(source='user.is_customer')
    account_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Member
        fields = '__all__'

    def validate(self, attrs):
        user = self.context.get('request')._user
        if (
            Member.objects.filter(id=user.id)
            and self.context.get('request').method == 'POST'
        ):
            raise ValidationError(
                'Профиль уже существует!'
            )
        return super().validate(attrs)

    def validate_user(self, freelancer):
        user = self.context.get('request').user
        if (
            Member.objects.filter(id=user.id)
            and self.context.get('request').method == 'POST'
        ):
            raise ValidationError(
                'Профиль уже существует!'
            )
        return user

    def create(self, validated_data):
        if 'user' not in self.initial_data:
            validated_data['user'] = self.context.get('request')._user
        profile = Member.objects.create(**validated_data)
        return profile


    def update(self, user, validated_data):
        profile = Member.objects.get(id=user.id)
        for field, value in validated_data.items():
            setattr(profile, field, value)
        profile.save()
        return profile


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
