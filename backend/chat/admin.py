from django.contrib import admin

from chat.models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'customer', 'worker', 'moderator')
    list_filter = ('customer', 'worker')
    search_fields = ('customer__display_name', 'worker__display_name', 'moderator__display_name')
    readonly_fields = ('uuid',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'created')
    list_filter = ('chat', 'sender')
    search_fields = ('chat__customer__display_name', 'chat__worker__display_name', 'chat__moderator__display_name')
    list_select_related = ('chat', 'sender')
    readonly_fields = ('id', 'created')
