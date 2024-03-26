from django.contrib import admin

from . import models
from .forms import WalletAdminForm



class WalletAdmin(admin.ModelAdmin):
    form = WalletAdminForm
    list_display = ('id',  'balance', 'holded', 'unconfirmed', 'label', 'get_address')

admin.site.register(models.Wallet, WalletAdmin)


class OperationAdmin(admin.ModelAdmin):
    list_display = ('id', 'description')

admin.site.register(models.Operation, OperationAdmin)


class AddressAdmin(admin.ModelAdmin):
    list_display = ('address', 'created', 'active', 'label', 'wallet', 'user')
    list_filter = ( 'active',)

admin.site.register(models.Address, AddressAdmin)


class BuyPaymentPeriodAdmin(admin.ModelAdmin):
    list_display = ('id', 'amount', 'discount')

admin.site.register(models.BuyPaymentPeriod, BuyPaymentPeriodAdmin)

class CustomerAccessPaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'start_at', 'expire_at', 'amount')

admin.site.register(models.CustomerAccessPayment, CustomerAccessPaymentAdmin)

class JobPaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'job','job_tier', 'start_at', 'expire_at', 'amount')

admin.site.register(models.JobPayment, JobPaymentAdmin)

class JobTierAdmin(admin.ModelAdmin):
    list_display = ('id', 'name','cost', 'description')

admin.site.register(models.JobTier, JobTierAdmin)