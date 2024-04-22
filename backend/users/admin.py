from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models.advertise import  Banners
from users.models.common import Region
from users.models.user import (Specialisation, Company, Member, Contact, Resume, CustomerReview,
                               Industry, Job, ResponseInvite)


@admin.register(Industry)
class StackAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    list_filter = ('name',)
    empty_value_display = '-пусто-'
# Для администирорования пользователей #

@admin.register(Banners)
class BannersAdmin(admin.ModelAdmin):
    list_display = ('link', 'alt',)
    list_filter = ('link', 'alt',)


@admin.register(ResponseInvite)
class ResponseInviteAdmin(admin.ModelAdmin):
    list_display = ('status', 'type', 'resume', 'job')
    list_filter = ('status', 'type', 'resume', 'job')

@admin.register(CustomerReview)
class CustomerReviewAdmin(admin.ModelAdmin):
    list_display = ('company', 'reviewer','comment', 'rating')
    list_filter =  ('company', 'reviewer','comment', 'rating')

@admin.register(Specialisation)
class SpecialisationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('name', 'slug',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'pub_date')
    list_filter = ( 'pub_date',)
    search_fields = ('title', 'description', 'client__user__username')
    empty_value_display = '-пусто-'

@admin.register(Contact)
class ContactsAdmin(admin.ModelAdmin):
    list_display = ('user', 'type',)
    empty_value_display = '-пусто-'


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name',)
    empty_value_display = '-пусто-'

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialisation', 'salary', 'deposit', 'work_experience', 'region',)
    empty_value_display = '-пусто-'



# Кастомный административный класс для модели
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('user', 'name')



@admin.register(Member)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'first_name', 'last_name','display_name',
                    'login', 'is_staff', 'is_active', 'is_moderator',
                    'is_customer', 'is_worker')
    list_filter = ('login', 'last_name',)
    fieldsets = (
        (None, {'fields': ('login','display_name')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Function', {'fields': ('is_customer', 'is_worker', 'is_moderator')})
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('login', 'first_name', 'last_name', 'display_name',
                       'is_customer', 'is_worker', 'is_active', 'is_moderator',
                       'password1', 'password2'),
        }),
    )
    ordering = ('login',)
