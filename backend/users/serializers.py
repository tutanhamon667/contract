from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from djoser import serializers as djoser_serializers
from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from .models import (Category, Contact, CustomerProfile, DiplomaFile,
                     Education, EducationDiploma, FreelancerCategory,
                     FreelancerContact, FreelancerEducation,
                     FreelancerPortfolio, FreelancerStack, Industry,
                     PortfolioFile, Stack, WorkerProfile)

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
            print(instance)
            EducationDiploma.objects.create(
                education=education,
                diploma=instance
            )
        return education

    def update(self, instance, validated_data):
        # diploma = validated_data.pop('diploma')
        # education = Education.objects.create(**validated_data)
        # for example in diploma:
        #     instance, status = DiplomaFile.objects.get_or_create(**example)
        #     EducationDiploma.objects.create(
        #         education=education,
        #         diploma=instance
        #     )
        # return education
        return


class PortfolioSerializer(serializers.ModelSerializer):
    freelancer = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    portfolio = PortfolioFileSerializer(many=True, read_only=True)

    class Meta:
        model = FreelancerPortfolio
        fields = '__all__'


class UserViewSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class WorkerProfileListSerializer(serializers.ModelSerializer):
    # user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    # freelancer = UserViewSerialiser(many=False, read_only=True)
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


class WorkerProfileCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    freelancer = UserViewSerialiser(many=False, read_only=True)
    contacts = ContactSerializer(many=True, required=True)
    stacks = StackSerializer(many=True, required=True)
    categories = CategorySerializer(many=True, required=True)
    education = PostEducationSerializer(many=True, required=True)
    portfolio = PortfolioSerializer(many=True, required=True)

    class Meta:
        model = WorkerProfile
        fields = '__all__'
#        fields = ('user', 'freelancer', 'contacts', 'activity',
#                  'stacks', 'payrate', 'about', 'job_example',
#                  'web', 'education', 'diploma_start_year',
#                  'diploma_finish_year', 'degree', 'faculty', 'diploma')

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
            instance, status = Contact.objects.get_or_create(**contact)
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
            instance, status = Education.objects.get_or_create(**stage)
            FreelancerEducation.objects.create(
                freelancer=profile,
                education=instance
            )

        for example in portfolio:
            instance, status = DiplomaFile.objects.get_or_create(**example)
            FreelancerPortfolio.objects.create(
                freelancer=profile,
                portfolio=instance
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
