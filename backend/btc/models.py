# -*- coding: utf-8 -*-
import binascii
from decimal import Decimal
from django.db import connection

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import validate_comma_separated_integer_list
from django.db import models
from django.db.models import Sum
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _

from btc import settings
from btc.validator import validate
from contract.settings import OPERATION_STATUS
from users.models.user import User, Member


class Wallet(models.Model):

    balance = models.DecimalField('Balance', max_digits=18, decimal_places=8, default=0)
    holded = models.DecimalField('Holded', max_digits=18, decimal_places=8, default=0)
    unconfirmed = models.DecimalField('Unconfirmed', max_digits=18, decimal_places=8, default=0)
    label = models.CharField('Label', max_length=100, blank=True, null=True, unique=True)
    mnemonic = models.CharField('Mnemonic', max_length=255, blank=False, null=False, unique=True, default='')
    def __str__(self):
        return u'{0} {1} "{2}"'.format(self.balance, self.label or '')

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
        return row[0]

    def get_address_incoming_transactions(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT t0.transaction_id, t0.key_id, t0.value, t1.txid, t1.date " +
                            "FROM transaction_outputs as t0 " +
                            "inner join transactions as t1 on t1.id = t0.transaction_id " +
                            "WHERE key_id=%s", [self.key_id])
            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({"transaction_id": row[0],"key_id": row[1],"value": row[2], "txid": binascii.hexlify(row[3]), "date": row[4]})
        return result


class Operation(models.Model):
    address = models.ForeignKey(Address, on_delete=models.CASCADE, default=None)
    created = models.DateTimeField('Created', default=now)
    cost_btc = models.DecimalField('Cost BTC', max_digits=18, decimal_places=8, default=0)
    cost_usd = models.DecimalField('Cost USD', max_digits=8, decimal_places=2, default=0)
    status = models.IntegerField(verbose_name="Status", choices=OPERATION_STATUS, default=0, blank=True)
    amount = models.IntegerField('Months values', default=1, null=False, blank=False)
    description = models.CharField('Description', max_length=100, blank=True, null=True)
    reason_content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.CASCADE)
    reason_object_id = models.PositiveIntegerField(null=True, blank=True)
    reason = GenericForeignKey('reason_content_type', 'reason_object_id')


class CustomerAccess(models.Model):
    user = models.ForeignKey(Member, on_delete=models.PROTECT, null=False, blank=False, default=None)
    created = models.DateTimeField('Created', default=now)
    expire_at = models.DateTimeField('Created', default=now)
