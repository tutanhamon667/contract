from django.db import models

from users.models.user import User
from django_ckeditor_5.fields import CKEditor5Field

class ArticleCategory(models.Model):
    title = models.CharField(verbose_name="Название раздела", max_length=255)
    parent = models.ForeignKey(to="ArticleCategory", on_delete=models.PROTECT, null=True, default=None, blank=True)
    link =  models.CharField(verbose_name="Ссылка", max_length=255, null=True, default=None, blank=True)
    order = models.IntegerField(verbose_name="порядковый номер", null=False, default=0)
    show_nav_menu = models.BooleanField(verbose_name="Показывать в навигационном меню", null=False, default=True)
    class Meta:
        verbose_name = 'Категория статей'
        verbose_name_plural = 'Категории статей'

    def __str__(self):
        return self.title


class Article(models.Model):

    title = models.CharField(
        verbose_name='Название статьи', max_length=255
    )
    category = models.ForeignKey(to="ArticleCategory", on_delete=models.PROTECT, null=True, default=None)
    text = CKEditor5Field( verbose_name='Текст', default='', config_name='extends', blank=True)
    link = models.CharField(verbose_name="Ссылка", max_length=255, null=True, default=None, blank=True)
    template = models.CharField(verbose_name="Название шаблона", max_length=255, default='article')
    order = models.IntegerField(verbose_name="порядковый номер", null=False, default=0)
    is_contact = models.BooleanField(verbose_name="Является контактом", null=False, default=False)
    photo = models.ImageField(
        upload_to='article/images/',
        null=True,
        default=None,
        blank=True,
        verbose_name='Фото или иконка'
    )

    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'

    def __str__(self):
        return self.title

    @property
    def get_link(self):
        if self.link is not None:
            return self.link
        else:
            return f'/article/{self.id}'






