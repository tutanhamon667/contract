from django.contrib import admin

from orders.models import Job, JobCategory, JobResponse
from users.models import CustomerProfile, Member, Stack, WorkerProfile


# Для администирорования пользователей #
@admin.register(Member)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'is_customer', 'is_worker')
    empty_value_display = '-пусто-'


@admin.register(WorkerProfile)
class FreelancerAdmin(admin.ModelAdmin):
    list_display = ('user', 'payrate',)
    filter_horizontal = ('stacks',)
    empty_value_display = '-пусто-'


@admin.register(CustomerProfile)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('user', 'industry')
    empty_value_display = '-пусто-'


@admin.register(Stack)
class StackAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    list_filter = ('name',)
    empty_value_display = '-пусто-'
# Для администирорования пользователей #


@admin.register(JobCategory)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    list_filter = ('name',)
    empty_value_display = '-пусто-'


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'pub_date')
    list_filter = ('category', 'stack', 'pub_date')
    search_fields = ('title', 'description', 'client__user__username')
    filter_horizontal = ('stack',)
    empty_value_display = '-пусто-'


@admin.register(JobResponse)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ('job', 'freelancer',)
    list_filter = ('job',)
    search_fields = ('job__title', 'freelancer__user__username')
