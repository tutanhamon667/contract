from django.contrib import admin

from chat.models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'freelancer')
    list_filter = ('customer', 'freelancer')
    search_fields = ('customer__username', 'freelancer__username')
    readonly_fields = ('id',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'timestamp')
    list_filter = ('chat', 'sender')
    search_fields = ('chat__customer__username', 'chat__freelancer__username')
    list_select_related = ('chat', 'sender')
    readonly_fields = ('id', 'timestamp')
