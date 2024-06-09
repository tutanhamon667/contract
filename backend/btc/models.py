# -*- coding: utf-8 -*-
import binascii
import datetime
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.db import connection

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Sum
from django.utils.timezone import now
from django.db.models import Q
from btc import settings

from contract.settings import OPERATION_STATUS
from users.models.user import  Member, Job

class Wallet(models.Model):

    balance = models.DecimalField('Balance', max_digits=18, decimal_places=8, default=0)
    holded = models.DecimalField('Holded', max_digits=18, decimal_places=8, default=0)
    unconfirmed = models.DecimalField('Unconfirmed', max_digits=18, decimal_places=8, default=0)
    label = models.CharField('Label', max_length=100, blank=True, null=True, unique=True)
    mnemonic = models.CharField('Mnemonic', max_length=255, blank=False, null=False, unique=True, default='')
    def __str__(self):
        return u'{0} {1}'.format(self.balance, self.label or '')

    def get_address(self):
        active = Address.objects.filter(wallet=self, active=True)[:1]
        if active:
            return active[0]

        unused = Address.objects.filter(wallet=None, active=True)[:1]
        if unused:
            free = unused[0]
            free.wallet = self
            free.save()
            return free

        old = Address.objects.filter(wallet=self, active=False)[:1]
        if old:
            return old[0]

    def withdraw(self, amount, description="", reason=None):
        if amount < 0:
            raise ValueError('Invalid amount')

        if self.balance - amount <= 0:
            raise ValueError('No money')

        Operation.objects.create(
            wallet=self,
            balance=-amount,
            description=description,
            reason=reason
        )
        self.balance -= amount
        self.save()

    def transfer(self, amount, deposite_wallet, reason=None, description=""):
        if amount < 0:
            raise ValueError('Invalid amount')

        if self.balance - amount < -settings.BTC_ALLOW_NEGATIVE_BALANCE:
            raise ValueError('No money')

        Operation.objects.create(
            wallet=self,
            balance=-amount,
            description=description,
            reason=reason
        )
        Operation.objects.create(
            wallet=deposite_wallet,
            balance=+amount,
            description=description,
            reason=reason
        )
        self.balance -= amount
        self.save()
        deposite_wallet.balance += amount
        deposite_wallet.save()


    def total_received(self):
        return Operation.objects.filter(wallet=self, balance__gt=0).aggregate(balance=Sum('balance'))['balance'] or Decimal('0')

    def recalc_balance(self, save=False):
        recalc = Operation.objects.filter(wallet=self).aggregate(balance=Sum('balance'),
                                   holded=Sum('holded'),
                                   unconfirmed=Sum('unconfirmed'))

        for k, v in recalc.items():
            if v is None:
                recalc[k] = Decimal('0')

        if save:
            self.balance = recalc['balance']
            self.holded = recalc['holded']
            self.unconfirmed = recalc['unconfirmed']
            self.save()

        return recalc

    def get_operations(self):
        return Operation.objects.filter(wallet=self).order_by('-created')



class Address(models.Model):

    address = models.CharField('Address', max_length=50, primary_key=True)
    created = models.DateTimeField('Created', default=now)
    active = models.BooleanField('Active', default=True)
    label = models.CharField('Label', max_length=50, blank=True, null=True, default=None)
    wif = models.CharField('wif', max_length=255, default='', null=False)
    wallet = models.ForeignKey(Wallet, blank=True, null=True, related_name="addresses", on_delete=models.CASCADE)
    user = models.ForeignKey(to=Member, on_delete=models.PROTECT, null=False, default=None)
    balance = models.DecimalField('Balance', max_digits=18, decimal_places=8, default=0)
    key_id = models.IntegerField('key_id', blank=True, null=True, default=None)
    def __str__(self):
        return u'{0}'.format(self.address)

    def get_key_info(cls):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM keys WHERE id = %s", [cls.key_id])
            row = cursor.fetchone()
        return row

    def get_address_incoming_transactions_value(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT sum(value) FROM transaction_outputs WHERE key_id=%s", [self.key_id])
            row = cursor.fetchone()
            if row[0] is not None:
                return row[0]
            else:
                return 0

    def get_address_incoming_transactions(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT t0.transaction_id, t0.key_id, t0.value, t1.txid, t1.date " +
                            "FROM transaction_outputs as t0 " +
                            "inner join transactions as t1 on t1.id = t0.transaction_id " +
                            "WHERE key_id=%s", [self.key_id])
            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({"transaction_id": row[0],"key_id": row[1],"value": row[2], "txid": binascii.hexlify(row[3]), "date": row[4], "paid_at":row[4]})
        return result


class Operation(models.Model):
    address = models.ForeignKey(Address, on_delete=models.CASCADE, default=None)
    created = models.DateTimeField('Created', default=now)
    paid_at = models.DateTimeField('Paid at', default=None, null=True, blank=True)
    cost_btc = models.DecimalField('Cost BTC', max_digits=18, decimal_places=8, default=0)
    cost_usd = models.DecimalField('Cost USD', max_digits=8, decimal_places=2, default=0)
    status = models.IntegerField(verbose_name="Status", choices=OPERATION_STATUS, default=0, blank=True)

    description = models.CharField('Description', max_length=100, blank=True, null=True)
    reason_content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.CASCADE)
    reason_object_id = models.CharField(null=True, blank=True)
    reason = GenericForeignKey('reason_content_type', 'reason_object_id')

    @classmethod
    def create_operation(cls, address, reason, reason_id, price_btc, price_usd,paid_at, status, description=""):
        reason_content_type = ContentType.objects.get_for_model(reason)
        new_operation = Operation(address=address, cost_btc=price_btc,paid_at=paid_at, description=description, cost_usd=price_usd, status=status,
                                  reason_content_type=reason_content_type,
                                  reason_object_id=reason_id)
        new_operation.save()
        return new_operation

    @property
    def description_str(self):
        if self.description:
            return self.description
        if str(self.reason) == 'CustomerAccessPayment':
            return 'Оплата доступа к базе резюме'
        else:
            return f'Оплата вакансии {self.reason.job.id}'

    @property
    def status_str(self):
        if self.status == 0:
            return "Оплачен"
        if self.status == 1:
            return "Ждёт оплаты"
        if self.status == 2:
            return "Заморожен"
        if self.status == 3:
            return "Отменён"

class BuyPaymentPeriod(models.Model):
    amount = models.IntegerField('Months values', default=1, null=False, blank=False)
    discount = models.IntegerField('Discount', default=0, null=False, blank=False)
    def __str__(self):
        return u'{0}           Скидка: {1}%'.format(self.amount, self.discount)


class JobTier(models.Model):
    name = models.CharField(verbose_name="tier name", blank=False, default="", null=False, max_length=255)
    cost = models.DecimalField(verbose_name="Cost",  blank=False, null=False, max_digits=8, decimal_places=2, default=0)
    description = models.CharField(verbose_name="Description", blank=False, default="", null=False, max_length=255)

    def __str__(self):
        return  u' {0}            {1}$'.format(self.name, self.cost)

class CustomerAccessPayment(models.Model):
    user = models.ForeignKey(Member, on_delete=models.PROTECT, null=False, blank=False, default=None)
    start_at = models.DateTimeField('Start at', default=None, null=True, blank=True)
    expire_at = models.DateTimeField('Created', default=None, null=True, blank=True)
    amount = models.ForeignKey(BuyPaymentPeriod, on_delete=models.PROTECT, null=False, blank=False, default=None)

    def __str__(self):
        return 'CustomerAccessPayment'

class JobPayment(models.Model):
    job = models.ForeignKey(Job, on_delete=models.PROTECT, null=False, blank=False, default=None)
    job_tier = models.ForeignKey(JobTier, default=None, blank=None, null=False, on_delete=models.PROTECT)
    start_at = models.DateTimeField('Start at', default=None, null=True, blank=True)
    expire_at = models.DateTimeField('Expire at', default=None, null=True, blank=True)
    amount = models.ForeignKey(BuyPaymentPeriod, on_delete=models.PROTECT, null=False, blank=False, default=None)

    @classmethod
    def get_job_active_payment(cls, job):
        now = datetime.datetime.now()
        payment = cls.objects.filter(Q(expire_at__gte=now) | Q(expire_at=None), job_id=job.id)
        if len(payment):
            return payment[0]
        else:
            return False

    @classmethod
    def join_tier(cls, objs):
        jobs_ids = []
        for job in objs:
            jobs_ids.append(job.id)
        active_job_payments = cls.objects.filter(start_at__lte=timezone.now(),
                                                        expire_at__gte=timezone.now(),
                                                        job_id__in=jobs_ids).values()
        return active_job_payments

    @transaction.atomic
    def _create_payment(self, tier, amount, job, start_at, expire_at):
        new_job_payment = JobPayment(job=job, job_tier_id=tier.id, amount_id=amount.id, start_at=start_at, expire_at=expire_at)
        new_job_payment.save()
        return new_job_payment

    @classmethod
    def prolong_payment(cls,  active_job_payment, amount_id, start_at=None, expire_at=None):
        amount = BuyPaymentPeriod.objects.get(id=amount_id)
        job = active_job_payment.job
        tier = active_job_payment.tier
        return JobPayment._create_payment( tier, amount, job, start_at, expire_at)

    @classmethod
    def create_payment(cls,  tier_id, amount_id, job, start_at=None, expire_at=None):
        d1 = datetime.datetime.now()
        amount = BuyPaymentPeriod.objects.get(id=amount_id)
        tier = JobTier.objects.get(id=tier_id)
        return JobPayment._create_payment(d1, tier, amount, job, start_at, expire_at)

    @transaction.atomic
    def close_period(self, close_date, cost_btc, cost_usd):
        self.expire_at = close_date















