from django.contrib.auth import get_user_model
from django.db import models


JOB_STATUSES = (
    ('Сбор заявок', 'Сбор заявок'),
    ('Сбор заявок завершен', 'Сбор заявок завершен')
)

User = get_user_model()


# Модели пользователей временные для работы модели заказов #
class Stack(models.Model):
    """
    Стэк технологий.
    """
    name = models.CharField(
        verbose_name='Название навыка', max_length=50
    )
    slug = models.SlugField(
        verbose_name='Идентификатор навыка', unique=True
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
# Модели пользователей временные для работы модели заказов #


class Category(models.Model):
    """
    Специализации.
    """
    name = models.CharField(
        verbose_name='Название специализации', max_length=50
    )
    slug = models.SlugField(
        verbose_name='Идентификатор специализации', unique=True
    )

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Специализация'
        verbose_name_plural = 'Специализации'

    def __str__(self):
        return self.name


class Job(models.Model):
    """
    Размещение заказов заказчиком.
    - Название заказа
    - Специализация
    - Навыки
    - Бюджет (альтернатива - Запрос предложений)
    - Срок (альтернатива - Запрос предложений)
    - Описание
    - Файлы
    - Заказчик (не отображется)
    - Дата создания (отображается при получении отдельного экземпляра)
    TODO:
    добавить валидацию полей (точно бюджет, дэдлайн, файлы)
    """
    title = models.CharField(
        verbose_name='Название задания', max_length=200
    )
    category = models.ManyToManyField(
        Category,
        related_name='jobs',
        verbose_name='Специализация',
        help_text='Выберите специализацию'
    )
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE
    )
    stack = models.ManyToManyField(
        Stack,
        related_name='jobs',
        verbose_name='Стек технологий',
        help_text='Укажите стек технологий'
    )
    description = models.TextField(
        verbose_name='Описание',
    )
    budget = models.DecimalField(
        max_digits=10, decimal_places=2,
        blank=True, null=True,
        verbose_name='Бюджет',
    )
    ask_budget = models.BooleanField(
        default=False,
    )
    deadline = models.DateTimeField(
        blank=True, null=True,
        verbose_name='Срок выполнения',
    )
    ask_deadline = models.BooleanField(
        default=False
    )
    files = models.FileField(
        upload_to='orders/job_files/',
        blank=True, null=True,
        verbose_name='Файлы к заданию',
    )
    status = models.CharField(
        max_length=20, choices=JOB_STATUSES,
        verbose_name='Статус задания',
    )
    pub_date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.ask_budget:
            self.budget = None
        if self.ask_deadline:
            self.deadline = None
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Задание'
        verbose_name_plural = 'Задания'

    def __str__(self):
        return self.title


class Response(models.Model):
    """
    Отклики фрилансеров на заказы.
    """
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'Отклик'
        verbose_name_plural = 'Отклики'

    def __str__(self):
        return (f'Отклик на заказ {self.job.title}'
                f'от {self.freelancer.username}')
