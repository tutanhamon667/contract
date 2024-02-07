import datetime
from io import BytesIO

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.validators import MinValueValidator
from django.db import models as basic_models
from PIL import Image
from ckeditor.fields import RichTextField
from contract.settings import CATEGORY_CHOICES, DATETIME_FORMAT, THUMBNAIL_SIZE, JOB_TARIFF
from users.models.user import CustomerProfile, WorkerProfile, Specialisation, User


class JobSpecialisationStat(basic_models.Model):

    Specialisation = basic_models.BigIntegerField(primary_key=True)
    name = basic_models.CharField(
        verbose_name='Название категории', max_length=50
    )

    count = basic_models.BigIntegerField(
        default=0,
        verbose_name='Количество'
    )

    min_one = basic_models.BigIntegerField(
        default=0,
        verbose_name='минимальная зп 1'
    )
    min_from = basic_models.BigIntegerField(
        default=0,
        verbose_name='минимальная зп 2'
    )
    class Meta:
        managed = False
        db_table = 'job_categories_info'
