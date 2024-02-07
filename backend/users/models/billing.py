import time

from django.db import models

from users.models.user import User


class JobType(models.Model):
    cost = models.FloatField(verbose_name="Price", max_length=10, default=0, null=False )
    priority = models.IntegerField(verbose_name="Priority", default=0, null=False)


class Transaction(models.Model):
    user = models.ForeignKey(User, verbose_name='User', on_delete=models.PROTECT)
    status = models.IntegerField(verbose_name='Paid status', default=0, null=False)
    paid_date = models.DateTimeField(verbose_name='Paid date', default=time.time(), null=False)
    fee = models.IntegerField(verbose_name='Fees', default=0, null=False)
