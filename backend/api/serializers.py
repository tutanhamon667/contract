from django.core.validators import FileExtensionValidator
from django.utils import timezone
from rest_framework import serializers

from api.utils import generate_thumbnail
from orders.models import (Category, Client, Freelancer, Job, Response, Stack,
                           StackJob)

# File requiremnts
MAX_FILE_SIZE_MB = 2
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_FILE_EXT = ['.jpg', '.jpeg', '.png', '.pdf']

# Error messages
FILE_OVERSIZE_ERR = f"Превышен размер файла: {MAX_FILE_SIZE_MB} МБ."
EXT_ERR = "Недопустимый формат файла. Разрешены:" + ', '.join(ALLOWED_FILE_EXT)
STACK_ERR_MSG = 'Укажите минимум 1 навык'
CURRENT_DATE_ERR = "Срок выполнения не может быть раньше сегодняшней даты."
PUB_DATE_ERR = "Срок выполнения не может быть раньше даты создания заказа."


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


class ResponseSerializer(serializers.ModelSerializer):
    """Откликнуться на задание."""
    user = serializers.IntegerField(source='user.freelancer.id')
    job = serializers.IntegerField(source='job.id')

    class Meta:
        model = Response
        fields = ('user', 'job',)

    def validate(self, data):
        user = data['user']['id']
        job = data['job']['id']
        if Response.objects.filter(user__id=user, job__id=job).exists():
            raise serializers.ValidationError(
                {'ошибка': 'Нельзя повторно откликнуться на задание.'}
            )
        return data

    def create(self, validated_data):
        user = validated_data['user']
        job = validated_data['job']
        Response.objects.get_or_create(user=user, job=job)
        return validated_data


class RespondedSerializer(serializers.ModelSerializer):
    """Получение заданий, на которые откликнулся."""
    class Meta:
        model = Job
        fields = ('id', 'title', 'category', 'budget',
                  'stack', 'client', 'description')


class JobListSerializer(serializers.ModelSerializer):
    """Получение списка заказов."""
    stack = StackSerializer(many=True)
    client = ClientSerializer()
    is_responded = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ('id', 'title', 'category', 'stack', 'client', 'budget',
                  'description', 'files', 'is_responded')

    def get_is_responded(self, obj):
        """
        Заказы, на которые фрилансер отправил отклик.
        """
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return Response.objects.filter(
            user=user,
            job=obj
        ).exists()


class JobCreateSerializer(serializers.ModelSerializer):
    """Создание задания."""
    client = serializers.HiddenField(default=serializers.CurrentUserDefault())
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
    )
    stack = StackSerializer(many=True,)
    files = serializers.FileField(
        max_length=MAX_FILE_SIZE,
        allow_empty_file=False,
        use_url=False,
        required=False,
        write_only=True,
        validators=[
            FileExtensionValidator(allowed_extensions=ALLOWED_FILE_EXT),
        ],
    )

    class Meta:
        model = Job
        fields = ('id', 'client', 'title', 'category', 'stack', 'budget',
                  'description', 'files')

    def validate_stack(self, data):
        stack = self.initial_data.get('stack')
        if stack == []:
            raise serializers.ValidationError(STACK_ERR_MSG)
        return data

    def validate_files(self, value):
        if value:
            file_extension = value.name.lower().split('.')[-1]
            if (value.size > MAX_FILE_SIZE
                    or file_extension not in ALLOWED_FILE_EXT):
                raise serializers.ValidationError(FILE_OVERSIZE_ERR)
        return value

    def validate_deadline(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError(CURRENT_DATE_ERR)
        if value < self.instance.pub_date.date():
            raise serializers.ValidationError(PUB_DATE_ERR)
        return value

    def create(self, validated_data):
        stack_data = validated_data.pop('stack')
        files_data = validated_data.pop('files')
        category_data = validated_data.pop('category')
        job = Job.objects.create(**validated_data)
        for skill in stack_data:
            stack_obj = Stack.objects.get_or_create(
                name=skill.get('name')
            )
            StackJob.objects.get_or_create(job=job, stack=stack_obj)
        if files_data:
            job.files = files_data
            job.thumbnail = generate_thumbnail(files_data)
        job.category.set(category_data)
        job.is_responded = False
        job.save()
        return job

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.budget = validated_data.get('budget', instance.budget)
        instance.description = validated_data.get(
            'description',
            instance.description
        )
        category_data = validated_data.get('category')
        if category_data:
            instance.category.set(category_data)
        stack_data = validated_data.get('stack')
        if stack_data:
            StackJob.objects.filter(job=instance).all().delete()
            for skill in stack_data:
                stack_obj = Stack.objects.get_or_create(
                    name=skill.get('name'))
                StackJob.objects.get_or_create(job=instance, stack=stack_obj)

            stack_obj.save()
        files_data = validated_data.get('files')
        if files_data:
            instance.files = files_data
            instance.thumbnail = generate_thumbnail(files_data)
        instance.save()
        return instance

    def to_representation(self, instance):
        serializer = JobListSerializer(
            instance,
            context=self.context
        )
        return serializer.data
