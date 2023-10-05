from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from djoser import serializers as djoser_serializers
from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField

from .models import Activity, Member, Stack, WorkerProfile, Contacts

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
        print(data)
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


class StackCreateSerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Stack
        fields = ('id', )


class ActivityCreateSerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Activity
        fields = ('id', )


class StackSerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Stack
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Activity
        fields = '__all__'


class ContactsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contacts
        fields = ('type', 'contact')


class UserViewSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name')


class WorkerProfileListSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    contacts = ContactsSerializer(source='contacts_set', many=True)
    job_example = Base64ImageField(required=True)
    diploma = Base64ImageField(required=True)
    activity = ActivitySerializer(many=True)
    stacks = StackSerializer(many=True)

    class Meta:
        model = WorkerProfile
        fields = ('user', 'first_name', 'last_name', 'contacts', 'activity',
                  'stacks', 'payrate', 'about', 'job_example',
                  'web', 'education', 'diploma_start_year',
                  'diploma_finish_year', 'degree', 'faculty', 'diploma')


class WorkerProfileCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    contacts = ContactsSerializer(source='contacts_set', many=True)
    job_example = Base64ImageField(required=True)
    diploma = Base64ImageField(required=True)
    activity = ActivityCreateSerializer(many=True)
    stacks = StackCreateSerializer(many=True)

    class Meta:
        model = WorkerProfile
        fields = ('user', 'first_name', 'last_name', 'contacts', 'activity',
                  'stacks', 'payrate', 'about', 'job_example',
                  'web', 'education', 'diploma_start_year',
                  'diploma_finish_year', 'degree', 'faculty', 'diploma')

    def validate_activity(self, attrs):
        print(self.initial_data['activity'])

        return self.initial_data['activity']

    def create(self, validated_data):
        print(validated_data)
        contacts = validated_data.pop('contacts_set')
        activity = validated_data.pop('activity')
        stacks = validated_data.pop('stacks')
        profile = WorkerProfile.objects.create(**validated_data)
        profile.activity.set(activity)
        profile.stacks.set(stacks)
        for contact in contacts:
            Contacts.objects.create(
                freelancer=profile,
                type=contact['type'],
                contact=contact['contact']
            )
        profile.save()
        return profile