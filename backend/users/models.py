from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

from .usermanager import UserManager


class Member(PermissionsMixin, AbstractBaseUser):
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


class Skil(models.Model):
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
    skils = models.ManyToManyField(
        Skil,
        blank=True,
        verbose_name='Необходимый навык'
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Profile(models.Model):
    photo = models.ImageField(
        upload_to='bio/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото'
    )
#    contacts
    activity = models.ManyToManyField(
        Activity,
        verbose_name='Специализация'
    )
    skil = models.ManyToManyField(
        Skil,
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
    diploma = models.FileField(
        blank=True,
        verbose_name='Дипломы, сертификаты, грамоты'
    )
    # education
    web = models.URLField(
        blank=True,
        verbose_name='Личный сайт'
    )


class Worker(models.Model):
    user = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
    )
    profile = models.OneToOneField(
        Profile,
        on_delete=models.PROTECT
    )
