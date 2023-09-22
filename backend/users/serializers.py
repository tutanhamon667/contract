from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from djoser import serializers as djoser_serializers
from rest_framework import serializers

from .fields import Base64ImageField
from .models import Activity, Member, Profile, Skil, Worker

User = get_user_model()


class UserCreateSerializer(
        djoser_serializers.UserCreatePasswordRetypeSerializer
        ):
    pass


class NewEmailSerializer(djoser_serializers.SetUsernameSerializer):
    pass


class SetPasswordSerializer(djoser_serializers.SetPasswordRetypeSerializer):
    pass


class UserViewSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name')
