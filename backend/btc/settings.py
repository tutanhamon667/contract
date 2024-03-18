from celery.schedules import crontab
from django.conf import settings
from decimal import Decimal

BTC_CONFIRMATIONS = getattr(settings, 'BTC_CONFIRMATIONS', 2)
BTC_ADDRESS_QUEUE = getattr(settings, 'BTC_ADDRESS_QUEUE', 20)
BTC_ALLOW_NEGATIVE_BALANCE = getattr(settings, 'BTC_ALLOW_NEGATIVE_BALANCE', Decimal('0.001'))
BTC_ACCOUNT = getattr(settings, 'BTC_ACCOUNT', '')
BTC_ALLOWED_HOSTS = getattr(settings, 'BTC_ALLOWED_HOSTS', ['localhost', '127.0.0.1'])


