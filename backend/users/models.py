from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

from .usermanager import UserManager


CONTACT_TYPE = [
    ('Phone number','Phone number'),
    ('Email', 'Email'),
    ('Telegram', 'Telegram'),
    ('Other', 'Other')
]


class Member(PermissionsMixin, AbstractBaseUser):
    username = None

    email = models.EmailField(
        verbose_name='email address',
        max_length=254,
        db_index=True,
        unique=True,
    )

    first_name = models.CharField(
        max_length=150,
    )

    last_name = models.CharField(
        max_length=150,
    )

    is_customer = models.BooleanField(default=False)
    is_worker = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    # is_superuser = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'is_customer', 'is_worker']

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

    @property
    def is_superuser(self):
        return self.is_admin


class Stack(models.Model):
    name = models.CharField(
        verbose_name='Необходимый навык',
        max_length=50,
        unique=True
    )
    slug = models.SlugField(
        max_length=50,
        unique=True,
        validators=[RegexValidator(
            regex=r'^[-a-zA-Z0-9_]+$',
            message='Используйте допустимые символы!'
        )]
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Activity(models.Model):
    name = models.CharField(
        verbose_name='Направление деятельности',
        max_length=200,
        unique=True
    )
    slug = models.SlugField(
        max_length=200,
        unique=True,
        validators=[RegexValidator(
            regex=r'^[-a-zA-Z0-9_]+$',
            message='Используйте допустимые символы!'
        )]
    )
    stacks = models.ManyToManyField(
        Stack,
        blank=True,
        verbose_name='Необходимый навык'
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class WorkerProfile(models.Model):
    user = models.OneToOneField(
        Member,
        on_delete=models.PROTECT
    )
    first_name = models.CharField(
        max_length=150,
    )

    last_name = models.CharField(
        max_length=150,
    )
    photo = models.ImageField(
        upload_to='bio/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото'
    )
    activity = models.ManyToManyField(
        Activity,
        blank=True,
        verbose_name='Специализация'
    )
    stacks = models.ManyToManyField(
        Stack,
        blank=True,
        verbose_name='Навык'
    )
    payrate = models.IntegerField(
        default=0,
        verbose_name='Ставка оплаты'
    )
    about = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='О себе'
    )
    job_example = models.ImageField(
        upload_to="examples/",
        blank=True,
        verbose_name='Примеры работ/портфолио'
    )
    diploma = models.ImageField(
        upload_to="diplomas/",
        blank=True,
        verbose_name='Дипломы, сертификаты, грамоты'
    )
    diploma_start_year = models.IntegerField(verbose_name='Начало учебы')
    diploma_finish_year = models.IntegerField(verbose_name='Окончание учебы')
    degree = models.CharField(verbose_name='Научная степень', max_length=150)
    faculty = models.CharField(verbose_name='Факультет', max_length=150)
    education = models.CharField(blank=False,
                                 max_length=150,
                                 verbose_name='Факультет',)
    web = models.URLField(
        blank=True,
        verbose_name='Личный сайт'
    )


class Contacts(models.Model):
    freelancer = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE)
    type = models.CharField(choices=CONTACT_TYPE,
                            max_length=150,)
    contact = models.CharField(max_length=150,
                               verbose_name='Контакт')
