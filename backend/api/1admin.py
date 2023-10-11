from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import (Category, CustomerProfile, Member, Stack,
                          WorkerProfile)

# admin.site.unregister(Member)


class StackAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    list_filter = ('name', 'slug',)


class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug',)
    list_filter = ('name', 'slug',)


@admin.register(Member)
class CustomUserAdmin(UserAdmin):
    list_display = ('first_name', 'last_name',
                    'email', 'is_staff', 'is_active',
                    'is_customer', 'is_worker')
    list_filter = ('email', 'last_name',)
    fieldsets = (
        (None, {'fields': ('email',)}),
        ('Personal info', {'fields': ('first_name', 'last_name')})
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name',
                       'is_customer', 'is_worker', 'is_active',
                       'password1', 'password2'),
        }),
    )
    ordering = ('email',)


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'payrate')
    list_filter = ('category', 'stacks')
    filter_horizontal = ('category', 'stacks')


# Кастомный административный класс для модели CustomerProfile
@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'industry')


admin.site.register(Stack, StackAdmin)
admin.site.register(Category, ActivityAdmin)
