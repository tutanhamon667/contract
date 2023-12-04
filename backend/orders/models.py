import datetime
from io import BytesIO

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.validators import MinValueValidator
from django.db import models
from PIL import Image

from taski.settings import CATEGORY_CHOICES, DATETIME_FORMAT, THUMBNAIL_SIZE
from users.models import CustomerProfile as Client
from users.models import Stack
from users.models import WorkerProfile as Freelancer


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
    budget = models.CharField(
        max_length=20,
        blank=True, null=True,
        help_text='Укажите сумму в рублях или выберете "Жду предложений"',
        verbose_name='Бюджет'
    )
    ask_budget = models.BooleanField(
        default=False,
        verbose_name='Запросить бюджет',
    )
    deadline = models.CharField(
        max_length=20,
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

    def get_budget_amount(self):
        """
        Возвращает числовое значение бюджета.
        """
        if self.budget == "Жду предложений":
            return None
        return int(self.budget)

    def get_budget_text(self):
        """
        Возвращает текстовое значение бюджета.
        """
        if self.budget == "Жду предложений":
            return "Жду предложений"
        return self.budget

    def get_deadline(self):
        """
        Возвращает дату срока выполнения задания.
        """
        if self.ask_deadline or not self.deadline:
            return None
        if self.deadline == "Жду предложений":
            return None
        return self.deadline.strftime(DATETIME_FORMAT)

    def get_deadline_text(self):
        """
        Возвращает текстовое представление срока выполнения задания.
        """
        if self.ask_deadline or not self.deadline:
            return "Жду предложений"
        return self.deadline

    class Meta:
        ordering = ('-id',)
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

    def clean(self):
        num_stacks_for_job = self.job.stack.count()
        if num_stacks_for_job >= 20:
            raise ValidationError("Максимальное количество тэгов - 20")

    def save(self, *args, **kwargs):
        self.clean()
        super(StackJob, self).save(*args, **kwargs)


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
