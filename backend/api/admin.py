from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from users.models import Activity, Member, Stack

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
                    'email', 'is_staff', 'is_active')
    list_filter = ('email', 'last_name',)
    fieldsets = (
        (None, {'fields': ('email',)}),
        ('Personal info', {'fields': ('first_name', 'last_name')})
    )
    ordering = ('email',)


admin.site.register(Stack, StackAdmin)
admin.site.register(Activity, ActivityAdmin)
