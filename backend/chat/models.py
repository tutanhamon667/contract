import datetime

from django.contrib.auth.models import User
from django.db import models
from asgiref.sync import sync_to_async
from django.utils import timezone

from contract.settings import CHAT_TYPE, CHAT_MESSAGE_TYPE
from users.models.user import Member, Job, ResponseInvite
import uuid

class Chat(models.Model):
    pkid = models.BigAutoField(primary_key=True, editable=False )
    uuid = models.UUIDField(primary_key=False, default=uuid.uuid4, editable=False, unique=True)
    customer = models.ForeignKey(
        Member,
        related_name='chat_customer',
        default=None,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        verbose_name = "Работодатель"
    )
    worker = models.ForeignKey(
        Member,
        related_name='chat_worker',
        default=None,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        verbose_name = "Соискатель"
    )

    moderator = models.ForeignKey(
        Member,
        related_name='chat_moderator',
        default=None,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        verbose_name = "Модератор"
    )

    response_invite = models.ForeignKey(
        ResponseInvite,
        related_name='chat_response_invite',
        default=None,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        verbose_name="отклик"
    )

    type = models.IntegerField(verbose_name="Тип чата", default=CHAT_TYPE["RESPONSE_INVITE"], null=False)


    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'

    def __str__(self):
        return f"Компания:{self.customer.company.name} - Соискатель:{self.worker.display_name} - Модератор:{self.moderator.display_name} / Type:{self.type}"



    @classmethod
    def get_user_chats(cls, user):
        if user.is_customer:
            return cls.objects.filter(customer=user)
        if user.is_worker:
            return cls.objects.filter(worker=user)
        if user.is_moderator:
            return cls.objects.filter(moderator=user)



class FileMessage(models.Model):
    existingPath = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=50)
    eof = models.BooleanField()
    created = models.DateTimeField(default=timezone.now)
    uploader = models.ForeignKey(
        Member,
        blank=True,
        null=True,
        on_delete=models.CASCADE
    )


class Message(models.Model):
    chat = models.ForeignKey(
        Chat,
        related_name='messages',
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        Member,
        blank=True,
        null=True,
        on_delete=models.CASCADE
    )
    type = models.IntegerField(verbose_name="Тип сообщения", choices=CHAT_MESSAGE_TYPE, default=0, blank=True)
    content = models.TextField(blank=True, default=None, null=True)
    created = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False, blank=True)
    file = models.ForeignKey(to=FileMessage, blank=True, default=None, null=True, on_delete=models.CASCADE)
    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f"{self.sender.first_name} - {self.sender.last_name}"

