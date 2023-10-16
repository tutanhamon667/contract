from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.validators import MinValueValidator
from django.db import models
from PIL import Image

from users.models import CustomerProfile as Client
from users.models import Stack
from users.models import WorkerProfile as Freelancer

THUMBNAIL_SIZE = (100, 100)
CATEGORY_CHOICES = (
    ('design', 'дизайн'),
    ('development', 'разработка'),
    ('testing', 'тестирование'),
    ('administration', 'администрирование'),
    ('marketing', 'маркетинг'),
    ('content', 'контент'),
    ('other', 'разное'),
)

'''
# Временные модели пользователей. Удалить после внедрения моделей
# пользователей из users

User = get_user_model()


class Stack(models.Model):
    """
    Стэк технологий.
    """
    name = models.CharField(
        verbose_name='Название навыка',
        max_length=50,
    )
    slug = models.SlugField(
        verbose_name='Идентификатор навыка',
        unique=True
    )

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Навык'
        verbose_name_plural = 'Навыки'

    def __str__(self):
        return self.name


class Account(models.Model):
    """
    Аккаунт пользователя.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'Аккаунт'
        verbose_name_plural = 'Аккаунты'


class Freelancer(models.Model):
    """
    Аккаунт фрилансера.
    """
    user = models.OneToOneField(Account, on_delete=models.CASCADE)
    skills = models.ManyToManyField(
        Stack, related_name='freelancers', blank=True
    )
    experience = models.TextField()
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    availability = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'Фрилансер'
        verbose_name_plural = 'Фрилансеры'


class Client(models.Model):
    """
    Аккаунт заказчика.
    """
    user = models.OneToOneField(Account, on_delete=models.CASCADE)
    industry = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        verbose_name = 'Заказчик'
        verbose_name_plural = 'Заказчики'
'''


class JobCategory(models.Model):
    """
    Специализации.
    """
    name = models.CharField(
        verbose_name='Название специализации',
        max_length=50,
        choices=CATEGORY_CHOICES
    )
    slug = models.SlugField(
        verbose_name='Идентификатор специализации',
        unique=True
    )

    class Meta:
        ordering = ('id',)
        verbose_name = 'Специализация'
        verbose_name_plural = 'Специализации'

    def __str__(self):
        return self.name


class File(models.Model):
    file = models.ImageField(upload_to='job_files/',
                             null=True,
                             verbose_name='Файлы задания',)


class Job(models.Model):
    """
    Размещение заказов заказчиком.
    """
    title = models.CharField(
        verbose_name='Название задания', max_length=200
    )
    category = models.ManyToManyField(
        JobCategory,
        related_name='jobs',
        verbose_name='Специализация',
        help_text='Выберите специализацию'
    )
    client = models.ForeignKey(
        Client,
        related_name='jobs',
        verbose_name='Заказчик',
        on_delete=models.CASCADE
    )
    stack = models.ManyToManyField(
        Stack,
        related_name='jobs',
        verbose_name='Стек технологий',
        help_text='Укажите стек технологий',
        through='StackJob'
    )
    description = models.TextField(
        verbose_name='Описание задания',
    )
    budget = models.PositiveIntegerField(
        blank=True, null=True,
        help_text='Укажите сумму в рублях или выберете "Жду предложений"',
        verbose_name='Бюджет',
        validators=[MinValueValidator(0)],
    )
    ask_budget = models.BooleanField(
        default=False,
        verbose_name='Запросить бюджет',
    )
    deadline = models.DateTimeField(
        blank=True, null=True,
        verbose_name='Срок выполнения или выберете "Жду предложений"',
    )
    ask_deadline = models.BooleanField(
        default=False,
        verbose_name='Запросить сроки',
    )
    pub_date = models.DateField(
        auto_now_add=True,
        verbose_name='Дата публикации задания',
    )

    # def save(self, *args, **kwargs):
    #     if self.ask_budget:
    #         self.budget = None
    #     if self.ask_deadline:
    #         self.deadline = None
    #     super().save(*args, **kwargs)

    class Meta:
        ordering = ('-pub_date',)
        verbose_name = 'Задание'
        verbose_name_plural = 'Задания'

    def __str__(self):
        return self.title


class StackJob(models.Model):
    """Стэк технологий в заказе."""
    job = models.ForeignKey(
        Job,
        verbose_name='Задание',
        related_name='job',
        on_delete=models.CASCADE,
    )
    stack = models.ForeignKey(
        Stack,
        on_delete=models.CASCADE,
        related_name='stack',
        verbose_name='Стэк'
    )

    class Meta:
        verbose_name = 'Стэк технологий'
        verbose_name_plural = 'Стэк технологий'

    def __str__(self):
        return f"{self.job.title} - {self.stack.name}"


class JobFile(models.Model):
    job = models.ForeignKey(Job,
                            on_delete=models.CASCADE,
                            related_name='job_files',
                            null=True,
                            blank=True)
    file = models.ImageField(upload_to='orders/job_files',)
    name = models.CharField(max_length=255)
    thumbnail = models.ImageField(
        upload_to='orders/job_files/thumbnails/',
        null=True,
        blank=True)

    def create_thumbnail(self):
        image = Image.open(self.file)
        thumbnail_size = THUMBNAIL_SIZE
        image.thumbnail(thumbnail_size)
        thumb_name = self.file.name.replace('.', '_thumb.')
        thumb_io = BytesIO()
        image.save(thumb_io, 'JPEG')
        self.thumbnail.save(thumb_name, InMemoryUploadedFile(
            thumb_io, None, thumb_name, 'image/jpeg', thumb_io.tell, None
        ))

        thumb_io.close()

    class Meta:
        verbose_name = 'Файл задания'
        verbose_name_plural = 'Файлы задания'

    def __str__(self):
        return f"{self.job.title} - {self.file}"


class JobResponse(models.Model):
    """
    Отклики фрилансеров на заказы.
    """
    job = models.ForeignKey(Job, on_delete=models.CASCADE,
                            related_name='responses')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE,
                                   related_name='responses')

    class Meta:
        unique_together = ('freelancer', 'job')
        verbose_name = 'Отклик'
        verbose_name_plural = 'Отклики'

    def __str__(self):
        return (f'Отклик на заказ {self.job.title}'
                f'от {self.freelancer.first_name}')
