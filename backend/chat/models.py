from django.contrib.auth.models import User
from django.db import models

from users.models.user import CustomerProfile, Member, WorkerProfile, Job


class Chat(models.Model):
    customer = models.ForeignKey(
        CustomerProfile,
        related_name='chat',
        on_delete=models.CASCADE
    )
    freelancer = models.ForeignKey(
        WorkerProfile,
        related_name='chat',
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    job = models.ForeignKey(
        Job,
        related_name='chat',
        null=True,
        on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'

    def __str__(self):
        return f"{self.title} - {self.freelancer.user.last_name}"


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
