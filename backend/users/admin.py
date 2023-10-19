from django.contrib import admin

from .models import Contact, Member, Stack, WorkerProfile

'''
@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name')
    empty_value_display = '-пусто-'


@admin.register(Contact)
class ContactsAdmin(admin.ModelAdmin):
    list_display = ('freelancer', 'type', 'contact',)
    empty_value_display = '-пусто-'
'''
