from django.contrib.auth.models import User
from django.db import models

from contract.settings import CHAT_TYPE
from users.models.user import Member, Job


class Chat(models.Model):
    customer = models.ForeignKey(
        Member,
        related_name='chat_customer',
        default=None,
        on_delete=models.PROTECT,
        verbose_name = "Работодатель"
    )
    worker = models.ForeignKey(
        Member,
        related_name='chat_worker',
        default=None,
        on_delete=models.PROTECT,
        verbose_name = "Соискатель"
    )

    moderator = models.ForeignKey(
        Member,
        related_name='chat_moderator',
        default=None,
        on_delete=models.PROTECT,
        verbose_name = "Модератор"
    )

    type = models.IntegerField(verbose_name="Тип чата", default=CHAT_TYPE["RESPONSE_INVITE"], null=False)


    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'

    def __str__(self):
        return f"Компания:{self.customer.company.name} - Соискатель:{self.worker.display_name} - Модератор:{self.moderator.display_name} / Type:{self.type}"


class Message(models.Model):
    chat = models.ForeignKey(
        Chat,
        related_name='messages',
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        Member,
        on_delete=models.CASCADE
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f"{self.sender.first_name} - {self.sender.last_name}"
