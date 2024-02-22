from io import BytesIO

from django.http import HttpResponse
from django_ckeditor_5.fields import CKEditor5Field
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
        default='',
        blank=True,
        null=True
    )

    first_name = encrypt(models.CharField(
        max_length=150,
        default='',
        blank=True,
        null=True

    ))

    last_name = encrypt(models.CharField(
        max_length=150,
        default='',
        blank=True,
        null=True
    ))

    photo = models.ImageField(
        upload_to='profile/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото'
    )

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

    @classmethod
    def has_customer_permission(cls, user_id):
        member = cls.objects.filter(id=user_id)
        if len(member) == 0:
            return HttpResponse(status=404)
        if member[0].is_worker:
            return HttpResponse(status=503)
        return member


User = get_user_model()


class Contact(models.Model):
    user = models.ForeignKey(to=Member, on_delete=models.CASCADE)
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
    icon = models.CharField(
        max_length=100,
        verbose_name='icon',
        blank=True,
        null=True,
        default=''
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
    icon = models.CharField(
        max_length=100,
        verbose_name='icon',
        blank=True,
        null=True,
        default=''
    )
    industry = models.ForeignKey(to=Industry, verbose_name="Отрасль", on_delete=models.CASCADE, null=True, default=None)

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Профессия'
        verbose_name_plural = 'Профессия'

    def __str__(self):
        return self.name


class Company(models.Model):
    user = models.OneToOneField(
        Member,
        on_delete=models.PROTECT
    )
    logo = models.ImageField(
        upload_to='company/images/',
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
    name = models.CharField(
        max_length=150,
        verbose_name='Название компании или ваше имя'
    )

    about = CKEditor5Field(
        blank=True,
        verbose_name='О себе', config_name='extends'
    )
    web = models.URLField(
        blank=True,
        verbose_name='Личный сайт'
    )

    class Meta:
        ordering = ('-name',)
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name


class CustomerReview(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='review_company',
        default=None,
        null=True,
        unique=False
    )
    reviewer = models.ForeignKey(
        Member,
        related_name='review_reviewer',
        on_delete=models.CASCADE,
        default=None,
        null=True,
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
    def get_top_companies(cls, limit):
        result = []
        res = cls.objects.values('company').annotate(avg_rating=Avg('rating'))
        for item in res:
            company = Member.objects.get(id=item['user'])
            result.append({'company': company, 'rating': item['avg_rating']})
        return  result

    @classmethod
    def get_company_rating(cls, company_id):
        res = cls.objects.values('company').annotate(avg_rating=Avg('rating')).filter(company_id=company_id)
        return res


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
    company = models.ForeignKey(
        Company,
        related_name='job_company',
        verbose_name='Компания',
        default=None,
        blank=True,
        null=True,
        on_delete=models.PROTECT
    )
    description = CKEditor5Field(
        verbose_name='Описание вакансии', config_name='extends'
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
    region = models.ManyToManyField(Region, verbose_name='Регион работы', null=True, default=None, blank=True)
    active_search = models.BooleanField(null=True, default=True, verbose_name='В активном поиске')
    deposit = models.IntegerField(verbose_name='Залог', null=True, default=0)
    views = models.IntegerField(verbose_name='Просмотры', null=True, default=0)

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

    @property
    def busy_type(self):
        str = ''
        if self.is_offline:
            str =  'Оффлайн занятость'
        else:
            str = 'Онлайн занятость'
        regions = self.region.all()
        regions_str = ''
        if len(regions):
            regions_str = ': '
        index = 0
        for region in regions:
            if index > 2:
                return str + regions_str + f' и ещё {len(regions) - index}'
            if index == 0:
                regions_str = regions_str + f'{region.name}'
            else:
                regions_str = regions_str + f', {region.name}'
            index += 1
        return str + regions_str



    @property
    def final_salary(self):
        if self.salary > 0:
            return self.salary
        else:
            if self.salary_from and self.salary_to:
                return f'{self.salary_from} - {self.salary_to}'
            else:
                if self.salary_from > 0:
                    return f' от {self.salary_from}'
                else:
                    return f'до {self.salary_to}'

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

