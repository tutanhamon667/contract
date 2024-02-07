import datetime
import random
import hashlib
import time


from django.db import models


class Banners(models.Model):
    photo = models.ImageField(
        upload_to='banners/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото'
    )
    link = models.CharField(
        max_length=250,
        verbose_name='ссылка'
    )
    alt = models.CharField(
        max_length=250,
        verbose_name='описание'
    )


