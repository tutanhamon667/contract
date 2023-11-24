from datetime import datetime
from datetime import timezone as tz

from django.utils import timezone
from rest_framework import serializers

from api.utils import CustomBase64ImageField
from chat.models import Chat, Message
from orders.models import Job, JobCategory, JobFile, JobResponse, StackJob
from taski.settings import (ASK_MSG, BUDGET_DATA_ERR, CATEGORY_CHOICES,
                            CHAT_ALREADY_EXISTS_ERR, CURRENT_DATE_ERR,
                            DATE_FORMAT_ERR, DATETIME_FORMAT,
                            FILE_OVERSIZE_ERR, JOB_ALREADY_APPLIED_ERR,
                            MAX_FILE_SIZE, STACK_ERR_MSG)
from users.clients import GetCustomerProfileSerializer, IndustrySerializer
from users.freelancers import GetWorkerProfileSerializer
from users.models import CustomerProfile as Client
from users.models import Stack, WorkerProfile


class ClientSerializer(serializers.ModelSerializer):
    """Заказчик."""
    industry = IndustrySerializer()

    class Meta:
        model = Client
        fields = ('id', 'user_id', 'photo', 'name',
                  'about', 'industry', 'web')


class JobStackSerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    class Meta:
        model = Stack
        fields = ('name',)


class JobCategorySerializer(serializers.ModelSerializer):
    """Стэк технологий."""
    name = serializers.ChoiceField(choices=CATEGORY_CHOICES)

    class Meta:
        model = JobCategory
        fields = ('id', 'name', 'slug')


class JobResponseSerializer(serializers.ModelSerializer):
    """Откликнуться на задание."""
    freelancer = serializers.IntegerField(source='freelancer.id',
                                          read_only=True)
    job = serializers.IntegerField(source='job.id',
                                   read_only=True)

    class Meta:
        model = JobResponse
        fields = ('job', 'freelancer',)

    def validate(self, data):
        freelancer = data['freelancer']['id']
        job = data['job']['id']
        if JobResponse.objects.filter(
                freelancer__id=freelancer, job__id=job).exists():
            raise serializers.ValidationError(JOB_ALREADY_APPLIED_ERR)
        return data

    def create(self, validated_data):
        freelancer = validated_data['freelancer']
        job = validated_data['job']
        JobResponse.objects.get_or_create(freelancer=freelancer, job=job)
        return validated_data


class RespondedSerializer(serializers.ModelSerializer):
    """Получение заданий, на которые откликнулся."""
    class Meta:
        model = Job
        fields = ('id', 'title', 'category', 'budget', 'stack',
                  'client', 'job_files', 'description',)


class FreelancerSerializer(GetWorkerProfileSerializer):
    class Meta:
        model = WorkerProfile
        fields = ('user', 'photo', 'about',
                  'stacks', 'payrate', 'categories')


class ResponseFreelancersSerializer(serializers.ModelSerializer):
    """Получение списка фрилансеров, которые откликнулись на задание."""
    freelancer = FreelancerSerializer()

    class Meta:
        model = JobResponse
        fields = '__all__'


class JobFileSerializer(serializers.ModelSerializer):
    """Изображения в профайлах"""
    file = CustomBase64ImageField(required=True)

    class Meta:
        model = JobFile
        fields = ('file', 'name')

    def validate_file(self, value):
        if value:
            if value.size > MAX_FILE_SIZE:
                raise serializers.ValidationError(FILE_OVERSIZE_ERR)
        return value


class JobListSerializer(serializers.ModelSerializer):
    """Получение списка заказов."""
    stack = JobStackSerializer(many=True)
    category = serializers.SlugRelatedField(
        read_only=True,
        many=True,
        slug_field='slug'
    )
    client = ClientSerializer()
    job_files = JobFileSerializer(
        read_only=True, many=True)
    is_responded = serializers.SerializerMethodField()
    budget = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ('id', 'title', 'category', 'stack', 'client',
                  'budget', 'ask_budget', 'deadline', 'ask_deadline',
                  'description', 'job_files', 'is_responded', 'pub_date')

    def get_budget(self, obj):
        if obj.budget == "Жду предложений" or not obj.budget.isdigit():
            return obj.budget
        return int(obj.budget)

    def get_is_responded(self, obj):
        """
        Заказы, на которые фрилансер отправил отклик.
        """
        user = self.context['request'].user
        if user.is_anonymous or user.is_customer:
            return False
        return JobResponse.objects.filter(
            freelancer__user=user,
            job=obj).exists()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.ask_budget:
            data['budget'] = 'Ожидает предложений'
        if instance.ask_deadline:
            data['deadline'] = 'Ожидает предложений'
        return data


class JobCreateSerializer(serializers.ModelSerializer):
    """Создание задания."""
    client_id = serializers.IntegerField(
        source='user.id',
        read_only=True
    )
    category = serializers.SlugRelatedField(
        queryset=JobCategory.objects.all(),
        many=True,
        slug_field='slug'
    )
    stack = JobStackSerializer(many=True,)
    job_files = JobFileSerializer(many=True, required=False)

    class Meta:
        model = Job
        fields = ('client_id', 'title', 'category', 'stack',
                  'budget', 'ask_budget', 'deadline', 'ask_deadline',
                  'description', 'job_files',)

    def validate_stack(self, data):
        if data == []:
            raise serializers.ValidationError(STACK_ERR_MSG)
        return data

    def validate_budget(self, value):
        if value is not None and value != ASK_MSG:
            try:
                int(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError(BUDGET_DATA_ERR)
        return value

    def validate_deadline(self, value):
        if value is not None and value != ASK_MSG:
            try:
                deadline = datetime.strptime(
                    value, DATETIME_FORMAT).replace(tzinfo=tz.utc)
                if deadline < timezone.now():
                    raise serializers.ValidationError(CURRENT_DATE_ERR)
            except ValueError:
                raise serializers.ValidationError(DATE_FORMAT_ERR)
        return value

    def create(self, validated_data):
        stack_data = validated_data.pop('stack')
        category_data = validated_data.pop('category')
        job_files_data = validated_data.pop('job_files')
        ask_budget = validated_data.pop('ask_budget', False)
        ask_deadline = validated_data.pop('ask_deadline', False)
        if ask_budget:
            validated_data['budget'] = ASK_MSG
            validated_data['ask_budget'] = True
        if ask_deadline:
            validated_data['deadline'] = ASK_MSG
            validated_data['ask_deadline'] = True
        job = Job.objects.create(**validated_data)
        for file in job_files_data:
            JobFile.objects.create(job=job,
                                   file=file['file'],
                                   name=file['name'])
        for skill in stack_data:
            name = skill.get('name')
            stack_obj, created = Stack.objects.get_or_create(
                name=name
            )
            StackJob.objects.get_or_create(
                job=job, stack=stack_obj
            )
        job.category.set(category_data)
        job.is_responded = False
        job.save()
        return job

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title',
                                            instance.title)
        instance.description = validated_data.get('description',
                                                  instance.description)
        ask_budget = validated_data.get('ask_budget',
                                        instance.ask_budget)
        if ask_budget:
            instance.budget = ASK_MSG
        else:
            instance.budget = validated_data.get('budget',
                                                 instance.budget)

        ask_deadline = validated_data.get('ask_deadline',
                                          instance.ask_deadline)
        if ask_deadline:
            instance.deadline = ASK_MSG
        else:
            instance.deadline = validated_data.get('deadline',
                                                   instance.deadline)
        category_data = validated_data.get('category')
        if category_data:
            instance.category.set(category_data)
        stack_data = validated_data.get('stack')
        if stack_data:
            StackJob.objects.filter(job=instance).all().delete()
            for skill in stack_data:
                stack_obj = Stack.objects.get_or_create(name=skill.get('name'))
                StackJob.objects.create(job=instance, stack=stack_obj)
        job_files_data = validated_data.get('job_files')
        if job_files_data:
            JobFile.objects.filter(job=instance).all().delete()
            for file_data in job_files_data:
                JobFile.objects.create(job=instance, **file_data)
        instance.save()
        return instance

    def to_representation(self, instance):
        serializer = JobListSerializer(
            instance,
            context=self.context
        )
        return serializer.data


class MessageSerializer(serializers.ModelSerializer):
    """
    Отдельные сообщения.
    """
    class Meta:
        model = Message
        fields = ('id', 'sender', 'content', 'timestamp')
        read_only_fields = ('sender',)


class ChatReadSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True)
    freelancer = GetWorkerProfileSerializer()
    customer = GetCustomerProfileSerializer()

    class Meta:
        model = Chat
        fields = ('id', 'title', 'job_id',
                  'customer', 'freelancer', 'messages')
        read_only_fields = ('customer',)


class ChatCreateSerializer(serializers.ModelSerializer):
    """
    Создания чата с отправкой сообщения:
    - для создания чата используется профиль заказчика
    - для создания сообщения - общий профиль пользователя
    - поле job_id не обязательное для чатов без привязки к заданию
    - поле  message_text не обязательное - заменяется на дефолтное
    """
    job_id = serializers.IntegerField(
        help_text="ID задания, к которому создается чат. "
                  "Необязательное поле. Оставьте его пустым"
                  " для создания чата без привязки к заданию.",
        required=False
    )
    message_text = serializers.CharField(
        help_text="Cообщение для начала чата. "
                  "Заменяется на дефолтное, если отставить пустым.",
        required=False
    )

    class Meta:
        model = Chat
        fields = ('id', 'job_id', 'customer', 'freelancer', 'message_text')
        read_only_fields = ('customer',)

    def validate(self, data):
        job_id = self.context['request'].data.get('job_id')
        freelancer_id = self.context['request'].data.get('freelancer')
        if Chat.objects.filter(job__id=job_id,
                               freelancer__id=freelancer_id).exists():
            raise serializers.ValidationError(CHAT_ALREADY_EXISTS_ERR)
        return data

    def create(self, validated_data):
        message_text = validated_data.pop('message_text', None)
        chat = super(ChatCreateSerializer, self).create(validated_data)

        if message_text:
            customer = chat.customer.user
            Message.objects.create(chat=chat,
                                   content=message_text,
                                   sender=customer)
        return chat
