from django.contrib import admin

from orders.models import  JobSpecialisationStat


@admin.register(JobSpecialisationStat)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    list_filter = ('name',)
    empty_value_display = '-пусто-'




