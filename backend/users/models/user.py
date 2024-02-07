from io import BytesIO

from ckeditor.fields import RichTextField
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from django.db.models import Sum, Count, Avg
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from PIL import Image

from contract.settings import CONTACT_TYPE, THUMBNAIL_SIZE
from .common import Region
from users.usermanager import UserManager
from django_cryptography.fields import encrypt, get_encrypted_field


class Member(PermissionsMixin, AbstractBaseUser):

    login = models.CharField(
        verbose_name='login',
        max_length=254,
        db_index=True,
        unique=True,
    )

    display_name = models.CharField(
        verbose_name='display_name',
        max_length=254,
        default=''
    )

    first_name = encrypt(models.CharField(
        max_length=150,
        default=''
    ))

    last_name = encrypt(models.CharField(
        max_length=150,
        default=''
    ))


    is_customer = models.BooleanField(default=False)
    is_worker = models.BooleanField(default=False)

    is_moderated = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    # is_superuser = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['display_name', 'password']

    def __str__(self):
        return self.display_name

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
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
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
        return f'{self.type} {self.value} {self.preferred}'


    @classmethod
    def is_current_user(cls, _id, user):
        resume = cls.objects.get(_id)
        return resume.user == user.id

    class Meta:
        verbose_name = 'Контакт'
        verbose_name_plural = 'Контакты'


class Industry(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name='Отрасль'
    )
    slug = models.CharField(
        max_length=255,
        verbose_name='alt',
        null = True,
        default = None
    )

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Отрасль'
        verbose_name_plural = 'Отрасль'
    def __str__(self):
        return self.name


class Specialisation(models.Model):
    """
    Специализации.
    """
    name = models.CharField(
        verbose_name='Название Профессия',
        max_length=250
    )

    slug = models.CharField(
        max_length=255,
        verbose_name='alt',
        null=True,
        default=None
    )
    industry = models.ForeignKey(to=Industry, verbose_name="Отрасль", on_delete=models.CASCADE, null=True, default=None)

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Профессия'
        verbose_name_plural = 'Профессия'

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


class WorkerProfile(models.Model):
    user = models.OneToOneField(
        Member,
        on_delete=models.PROTECT
    )

    photo = models.ImageField(
        upload_to='bio/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото'
    )

    class Meta:
        verbose_name = 'Соискатель'
        verbose_name_plural = 'Соискатель'

    def __str__(self):
        return self.user.display_name


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
    email = encrypt(models.EmailField(
        verbose_name='публичный email для связи',
        max_length=254,
        db_index=True,
        null=True,
        blank=True,
        unique=True,
    ))
    company_name = models.CharField(
        max_length=150,
        verbose_name='Название компании или ваше имя'
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

    class Meta:
        ordering = ('-company_name',)
        verbose_name = 'Работодатель'
        verbose_name_plural = 'Работодатели'

    def __str__(self):
        return self.company_name



class CustomerReview(models.Model):
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        unique=False
    )
    reviewer = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        unique=False

    )
    comment = models.TextField(
        max_length=500,
        verbose_name='Комментарий'
    )
    rating = models.IntegerField(verbose_name='Оценка', null=True, default=5)
    pub_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата публикации вакансии',
    )
    moderated = models.BooleanField(verbose_name='Прошёл модерацию', default=False)

    @classmethod
    def get_top_customers(cls, limit):
        result = []
        res = cls.objects.values('customer').annotate(avg_rating=Avg('rating'))
        for item in res:
            customer = CustomerProfile.objects.get(id=item['customer'])
            result.append({'customer': customer, 'rating': item['avg_rating']})
        return  result


class Resume(models.Model):
    class Meta:
        verbose_name='Резюме пользователя'
        verbose_name_plural = 'Резюме пользователей'
    name = models.CharField(null=False, max_length=255, verbose_name='Наименование должности', default='')
    description = models.CharField(null=False, max_length=255, verbose_name='Описание должности', default='')
    user = models.ForeignKey(to=Member,
                               on_delete=models.CASCADE,
                               related_name='f_resume_member',
                               verbose_name='Пользователь')
    specialisation = models.ForeignKey(to=Specialisation,
                              on_delete=models.SET_DEFAULT,
                              default=None,
                              null=True,
                              related_name='f_resume_stack',
                              verbose_name='Профессия')
    active_search = models.BooleanField(null=True, default=True, verbose_name='В активном поиске')
    salary = models.IntegerField(verbose_name='Желаемая заработная плата', null=True, default=0)
    deposit = models.IntegerField(verbose_name='Залог', null=True, default=0)
    work_experience = models.IntegerField(verbose_name='Опыт работы (месяцы)', null=True, default=0)
    is_offline = models.BooleanField(verbose_name='Оффлайн работа', null=False, default=False)
    is_fulltime = models.BooleanField(verbose_name='Полная занятость', null=False, default=False)
    region = models.ForeignKey(verbose_name='Регион работы',
                               to=Region,
                               null=True,
                               default=None,
                               on_delete=models.SET_DEFAULT)

    @classmethod
    def is_current_user(cls, _id, user):
        resume = cls.objects.get(_id)
        return resume.user == user.id


    def __str__(self):
        return self.name



class Job(models.Model):
    """
    Размещение заказов заказчиком.
    """
    title = models.CharField(
        verbose_name='Название вакансии', max_length=200
    )
    specialisation = models.ForeignKey(
        Specialisation,
        related_name='jobs',
        verbose_name='Специализация',
        null=True,
        default=None,
        help_text='Выберите специализацию',
        on_delete=models.CASCADE
    )
    customer = models.ForeignKey(
        User,
        related_name='jobs',
        verbose_name='Работодатель',
        on_delete=models.CASCADE
    )
    description = RichTextField(
        verbose_name='Описание вакансии',
    )
    salary = models.BigIntegerField(
        default=0,
        verbose_name='Зарплата'
    )
    salary_from = models.BigIntegerField(
        default=0,
        verbose_name='Зарплата от'
    )
    salary_to = models.BigIntegerField(
        default=0,
        verbose_name='Зарплата до'
    )

    work_experience = models.IntegerField(
        default=0,
        verbose_name='Опыт работы в месяцах'
    )
    is_offline = models.BooleanField(verbose_name='Оффлайн работа', null=False, default=False)
    is_fulltime = models.BooleanField(verbose_name='Полная занятость', null=False, default=False)
    region = models.ForeignKey(verbose_name='Регион работы',
                               to=Region,
                               null=True,
                               default=None,
                               on_delete=models.SET_DEFAULT)
    active_search = models.BooleanField(null=True, default=True, verbose_name='В активном поиске')
    deposit = models.IntegerField(verbose_name='Залог', null=True, default=0)

    pub_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата публикации вакансии',
    )

    class Meta:
        ordering = ('-id',)
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'

    def __str__(self):
        return self.title

    @classmethod
    def is_current_user(cls, _id, user):
        obj = cls.objects.get(_id)
        return obj.user == user.id


    @classmethod
    def get_new_jobs(cls, limit):
        return cls.objects.all().order_by('-id')[:limit]

    @classmethod
    def get_hot_jobs(cls, limit):
        return cls.objects.all().order_by('-id')[:limit]

