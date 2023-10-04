from django.contrib import admin

from orders.models import Category, Job, Response

'''
# Временные модели пользователей. Удалить после внедрения моделей
# пользователей из users

# Модели пользователей временные для работы модели заказов #
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('user',)
    empty_value_display = '-пусто-'


@admin.register(Freelancer)
class FreelancerAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'availability')
    filter_horizontal = ('skills',)
    empty_value_display = '-пусто-'


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('user', 'industry')
    empty_value_display = '-пусто-'
# Модели пользователей временные для работы модели заказов #


@admin.register(Stack)
class StackAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    list_filter = ('name',)
    empty_value_display = '-пусто-'
'''


@admin.register(Category)
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


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ('job', 'freelancer',)
    list_filter = ('job',)
    search_fields = ('job__title', 'freelancer__user__username')
