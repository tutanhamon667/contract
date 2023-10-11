from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from .models import (Category, Contact, DiplomaFile, Education,
                     EducationDiploma, FreelancerCategory, FreelancerContact,
                     FreelancerEducation, FreelancerPortfolio, FreelancerStack,
                     PortfolioFile, Stack, WorkerProfile)

User = get_user_model()


class UserViewSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name')


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


class StackSerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Stack
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Category
        fields = '__all__'


class DiplomaFileSerializer(serializers.ModelSerializer):
    file = Base64ImageField(required=False)

    class Meta:
        model = DiplomaFile
        fields = '__all__'


class PortfolioFileSerializer(serializers.ModelSerializer):
    file = Base64ImageField(required=False)

    class Meta:
        model = PortfolioFile
        fields = '__all__'


class GetEducationSerializer(serializers.ModelSerializer):
    diploma = DiplomaFileSerializer(many=True, read_only=True)

    class Meta:
        model = Education
        fields = '__all__'


class PostEducationSerializer(serializers.ModelSerializer):
    diploma = DiplomaFileSerializer(many=True, required=False)

    class Meta:
        model = Education
        fields = '__all__'

    def create(self, validated_data):
        diploma = validated_data.pop('diploma')
        education = Education.objects.create(**validated_data)
        for example in diploma:
            instance, status = DiplomaFile.objects.get_or_create(**example)
            EducationDiploma.objects.create(
                education=education,
                diploma=instance
            )
        return education

    def update(self, instance, validated_data):
#        diploma = validated_data.pop('diploma')
#        education = Education.objects.create(**validated_data)
#        for example in diploma:
#            instance, status = DiplomaFile.objects.get_or_create(**example)
#            EducationDiploma.objects.create(
#                education=education,
#                diploma=instance
#            )
#        return education
        return


class PortfolioSerializer(serializers.ModelSerializer):
    freelancer = serializers.HiddenField(default=serializers.CurrentUserDefault())
    portfolio = PortfolioFileSerializer(many=True)

    class Meta:
        model = FreelancerPortfolio
        fields = '__all__'


class GetWorkerProfileSerializer(serializers.ModelSerializer):
#    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
#    freelancer = UserViewSerialiser(many=False, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    contacts = ContactSerializer(many=True)
    stacks = StackSerializer(many=True)
    categories = CategorySerializer(many=True)
    education = GetEducationSerializer(many=True)
    portfolio = PortfolioSerializer(many=True)

    class Meta:
        model = WorkerProfile
        fields = '__all__'
#        fields = ('user', 'first_name', 'last_name', 'contacts', 'activity',
#                  'stacks', 'payrate', 'about', 'job_example',
#                  'web', 'education', 'diploma_start_year',
#                  'diploma_finish_year', 'degree', 'faculty', 'diploma')


class PostWorkerProfileSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    contacts = ContactSerializer(many=True, required=True)
    stacks = StackSerializer(many=True, required=True)
    categories = CategorySerializer(many=True, required=True)
    education = PostEducationSerializer(many=True, required=True)
    portfolio = PortfolioFileSerializer(many=True, required=True)

    class Meta:
        model = WorkerProfile
        fields = '__all__'

    def validate_user(self, user):
        if WorkerProfile.objects.filter(user_id=user.id):
            raise ValidationError(
                'Профиль уже существует'
            )
        return user

    def create(self, validated_data):
        contacts = validated_data.pop('contacts')
        stacks = validated_data.pop('stacks')
        categories = validated_data.pop('categories')
        education = validated_data.pop('education')
        portfolio = validated_data.pop('portfolio')
        
        profile = WorkerProfile.objects.create(**validated_data)

        for contact in contacts:
            instance = Contact.objects.create(**contact)
            FreelancerContact.objects.create(
                freelancer=profile,
                contact=instance
            )

        for stack in stacks:
            instance, status = Stack.objects.get_or_create(**stack)
            FreelancerStack.objects.create(
                freelancer=profile,
                stack=instance
            )

        for category in categories:
            instance, status = Category.objects.get_or_create(**category)
            FreelancerCategory.objects.create(
                freelancer=profile,
                category=instance
            )

        for stage in education:
            diploma = stage.pop('diploma')
            instance = Education.objects.create(**stage)

            for example in diploma:
                file = DiplomaFile.objects.create(**example)
                EducationDiploma.objects.create(
                    education=instance,
                    diploma=file
                )
            FreelancerEducation.objects.create(
                freelancer=profile,
                education=instance
            )

        for example in portfolio:
            file = PortfolioFile.objects.create(**example)
            file.create_thumbnail()
            FreelancerPortfolio.objects.create(
                freelancer=profile,
                portfolio=file
            )
        profile.save()
        return profile

    def update(self, instance, validated_data):
        contacts = validated_data.pop('contacts_set')
        activityes = validated_data.pop('activity')
        stacks = validated_data.pop('stacks')
#        FreelancerActivity.objects.filter(freelancer=instance).delete()
#        FreelancerStack.objects.filter(freelancer=instance).delete()
        Contact.objects.filter(freelancer=instance).delete()
        for activity in activityes:
            ac, status = Category.objects.get_or_create(**activity)
#            FreelancerActivity.objects.create(
#                freelancer=instance,
#                activity=ac
#            )
        for stack in stacks:
            st, status = Stack.objects.get_or_create(**stack)
#            FreelancerStack.objects.create(
#                freelancer=instance,
#                stack=st
#            )
        for contact in contacts:
            Contact.objects.create(
                freelancer=instance,
                type=contact['type'],
                contact=contact['contact']
            )
        return super().update(instance, validated_data)
