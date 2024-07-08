import datetime
import random
import hashlib
import time

from django.core.cache import cache

from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from django.utils.encoding import smart_str
import django_tables2 as tables


if hasattr(random, "SystemRandom"):
	randrange = random.SystemRandom().randrange
else:
	randrange = random.randrange
MAX_RANDOM_KEY = 18446744073709551616  # 2 << 63
CHOICES_MODERATE_STATUS = (
	(0, 'Новый'),
	(1, 'Принят'),
	(2, 'Отклонён'),
	(3, 'Удалён'),
)


class ModerateRequest(models.Model):
	status = models.IntegerField(null=False, default=0,  choices=CHOICES_MODERATE_STATUS)
	comment = models.CharField(max_length=255, null=True, blank=True, default='')
	final_comment = models.CharField(max_length=255, null=True, blank=True, default='', verbose_name='Комментарий')
	reason_content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.CASCADE)
	reason_object_id = models.CharField(null=True, blank=True)
	reason = GenericForeignKey('reason_content_type', 'reason_object_id', for_concrete_model=False)
	changes = models.JSONField(null=True, blank=True, verbose_name='Изменения', default=None)
	created_at = models.DateTimeField(auto_now_add=True, db_index=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Запрос на модерацию'
		verbose_name_plural = 'Запросы на модерацию'
		
	def __str__(self):
		if hasattr(self.reason, 'original_object') :
			return str(self.reason.original_object)
		return str(self.reason)
		
	def get_absolute_url(self):
		return 'review/{self.id}'.format(self=self)
	
	def close(self, final_comment):
		self.status = 3
		self.final_comment = final_comment
		self.save()
		
		
	@classmethod
	def create_request(cls, content_type_model, object_id, changes = None, comment=''):
		content_type = ContentType.objects.get_for_model(content_type_model)
		new_request = cls(reason_content_type=content_type, reason_object_id=object_id, changes=changes, comment=comment)
		new_request.save()
		opened_items = cls.objects.filter(reason_content_type=content_type, reason_object_id=object_id, status=0).exclude(id=new_request.id)
		
		if len(opened_items) > 0:
			for item in opened_items:
				item.close('Заменён автоматически реквестом {}'.format(new_request.id))

		return new_request
	
	def decline(self, comment):
		self.status = 2
		self.final_comment = comment
	   


	def accept(self, comment):
		self.status = 1
		self.final_comment = comment
	 
		


class ModerateRequestTable(tables.Table):
	class Meta:
		model = ModerateRequest
		
		

class Region(models.Model):
	name = models.CharField(null=False, max_length=50)

	class Meta:
		verbose_name = 'Регион'
		verbose_name_plural = 'Регионы'

	def __str__(self):
		return self.name


class Captcha():

	def __init__(self):
		pass

	def __str__(self):
		return self.challenge


	@classmethod
	def check_chaptcha(cls, captcha, hash):
		try:
			res = cache.get(hash)
			return res == captcha
		except Exception as e:
			print(f"Каптча не найдена: {e}")
			return False

	@classmethod
	def get_captcha_challenge(cls, hash):
		try:
			return cache.get(hash)
		except Exception as e:
			print(f"Каптча не найдена: {e}")
			return False

	@classmethod
	def generate_key(cls, generator=None):
		challenge = ""
		chars, ret = "abcdefghijklmnopqrstuvwxyz", ""
		for i in range(5):
			challenge += random.choice(chars)

		key_ = (
				smart_str(randrange(0, MAX_RANDOM_KEY))
				+ smart_str(time.time())
				+ smart_str(challenge, errors="ignore")
		).encode("utf8")
		hash_key = hashlib.sha1(key_).hexdigest()
		cache.set(hash_key, challenge, timeout=600)
		return challenge, hash_key
	@classmethod
	def pick(cls):
		return cls.generate_key()







