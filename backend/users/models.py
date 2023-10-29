from io import BytesIO

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models
from PIL import Image

from taski.settings import CATEGORY_CHOICES, CONTACT_TYPE, THUMBNAIL_SIZE
from users.usermanager import UserManager


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


User = get_user_model()


class Contact(models.Model):
    type = models.CharField(
        choices=CONTACT_TYPE,
        max_length=150,
    )
    value = models.CharField(
        max_length=150,
        verbose_name='Контакт'
    )
    preferred = models.BooleanField(
        default=False,
        verbose_name='Предпочитаемый вид контакта'
    )

    def __str__(self):
        return f'{self.type} {self.contact} {self.preferred}'


class Stack(models.Model):
    name = models.CharField(
        verbose_name='Необходимый навык',
        max_length=50,
        unique=False
    )
    slug = models.SlugField(
        max_length=50,
        blank=True,
        unique=False,
        validators=[RegexValidator(
            regex=r'^[-a-zA-Z0-9_]+$',
            message='Используйте допустимые символы!'
        )]
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Category(models.Model):
    """
    Специализации.
    """
    name = models.CharField(
        verbose_name='Название специализации',
        max_length=50,
        choices=CATEGORY_CHOICES
    )
    slug = models.SlugField(
        blank=True,
        verbose_name='Идентификатор специализации',
        unique=False
    )

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Специализация'
        verbose_name_plural = 'Специализации'

    def __str__(self):
        return self.name


class PortfolioFile(models.Model):
    file = models.ImageField(
        upload_to="portfolio/",
    )
    name = models.CharField(
        max_length=255,
        verbose_name='Имя документа'
    )
    thumbnail = models.ImageField(
        upload_to='portfolio/thumnails/',
        null=True,
        blank=True)

    def create_thumbnail(self):
        image = Image.open(self.file, 'r')
        thumbnail_size = THUMBNAIL_SIZE
        image.thumbnail(thumbnail_size)
        x, thumb_name = self.file.name.replace('.', '_thumb.').split('/')
        thumb_io = BytesIO()
        image.save(thumb_io, 'png')
        self.thumbnail.save(
            thumb_name,
            InMemoryUploadedFile(
                thumb_io, None,
                thumb_name, 'image/png',
                thumb_io.tell, None
            ),
            save=True
        )
        thumb_io.close()


class DiplomaFile(models.Model):
    file = models.ImageField(
        upload_to="education/"
    )
    name = models.CharField(
        max_length=255,
        verbose_name='Имя документа'
    )
    thumbnail = models.ImageField(
        upload_to='education/thumbnails/',
        null=True,
        blank=True)

    def create_thumbnail(self):
        image = Image.open(self.file, 'r')
        thumbnail_size = THUMBNAIL_SIZE
        image.thumbnail(thumbnail_size)
        x, thumb_name = self.file.name.replace('.', '_thumb.').split('/')
        thumb_io = BytesIO()
        image.save(thumb_io, 'png')
        self.thumbnail.save(
            thumb_name,
            InMemoryUploadedFile(
                thumb_io, None,
                thumb_name, 'image/png',
                thumb_io.tell, None
            ),
            save=True
        )
        thumb_io.close()


class Education(models.Model):
    name = models.CharField(
        verbose_name='Учебное заведение',
        blank=False,
        max_length=150,
        default=None,
    )
    faculty = models.CharField(
        verbose_name='Факультет',
        blank=False,
        max_length=150,
        default=None,
    )
    start_year = models.IntegerField(
        verbose_name='Начало учебы',
        default=2023
    )
    finish_year = models.IntegerField(
        verbose_name='Окончание учебы',
        default=2023
    )
    degree = models.CharField(
        verbose_name='Научная степень',
        max_length=150,
        default='Бакалавриат'
    )
    diploma = models.ManyToManyField(
        DiplomaFile,
        through='EducationDiploma'
    )

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Образование'

    def __str__(self):
        return self.name


class WorkerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT
    )
    photo = models.ImageField(
        upload_to='bio/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото'
    )
    payrate = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Ставка оплаты'
    )
    about = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='О себе'
    )
    web = models.URLField(
        blank=True,
        verbose_name='Личный сайт'
    )
    contacts = models.ManyToManyField(
        Contact,
        through='FreelancerContact'
    )
    stacks = models.ManyToManyField(
        Stack,
        blank=True,
        through='FreelancerStack'
    )
    categories = models.ManyToManyField(
        Category,
        through='FreelancerCategory'
    )
    portfolio = models.ManyToManyField(
        PortfolioFile,
        blank=True,
        through='FreelancerPortfolio'
    )
    education = models.ManyToManyField(
        Education,
        blank=True,
        through='FreelancerEducation'
    )


class FreelancerContact(models.Model):
    freelancer = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='f_contact'
    )
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='f_contact'
    )


class FreelancerStack(models.Model):
    freelancer = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='f_stack'
    )
    stack = models.ForeignKey(
        Stack,
        on_delete=models.CASCADE,
        related_name='f_stack'
    )


class FreelancerCategory(models.Model):
    freelancer = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='f_category'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='f_category'
    )


class EducationDiploma(models.Model):
    diploma = models.ForeignKey(
        DiplomaFile,
        on_delete=models.CASCADE,
        related_name='f_diploma'
    )
    education = models.ForeignKey(
        Education,
        on_delete=models.CASCADE,
        related_name='f_diploma'
    )


class FreelancerEducation(models.Model):
    freelancer = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
    )
    education = models.ForeignKey(
        Education,
        on_delete=models.CASCADE,
    )


class FreelancerPortfolio(models.Model):
    freelancer = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='f_portfolio'
    )
    portfolio = models.ForeignKey(
        PortfolioFile,
        on_delete=models.CASCADE,
        related_name='f_portfolio'
    )


class Industry(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name='Сфера деятельности'
    )


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT
    )
    photo = models.ImageField(
        upload_to='about/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото или логотип'
    )
    email = models.EmailField(
        verbose_name='публичный email для связи',
        max_length=254,
        db_index=True,
        blank=True,
        unique=True,
    )
    name = models.CharField(
        max_length=150,
        verbose_name='Название компании или ваше имя'
    )
    industry = models.ForeignKey(
        Industry,
        blank=True,
        null=True,
        on_delete=models.PROTECT
    )
    about = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='О себе'
    )
    web = models.URLField(
        blank=True,
        verbose_name='Личный сайт'
    )

    def __str__(self):
        return self.name
