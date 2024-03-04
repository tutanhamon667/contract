import datetime
from io import BytesIO

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django_ckeditor_5.fields import CKEditor5Field
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from django.db.models import Sum, Count, Avg
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models import Q
from PIL import Image

from contract.settings import CONTACT_TYPE, THUMBNAIL_SIZE, RESPONSE_INVITE_TYPE, RESPONSE_INVITE_STATUS
from .common import Region
from users.usermanager import UserManager
from django_cryptography.fields import encrypt, get_encrypted_field


class Member(PermissionsMixin, AbstractBaseUser):
	login = models.CharField(
		verbose_name='login',
		max_length=254,
		db_index=True,
		unique=True,
	)

	display_name = models.CharField(
		verbose_name='display_name',
		max_length=254,
		default='',
		blank=True,
		null=True
	)

	first_name = encrypt(models.CharField(
		max_length=150,
		default='',
		blank=True,
		null=True

	))

	last_name = encrypt(models.CharField(
		max_length=150,
		default='',
		blank=True,
		null=True
	))

	photo = models.ImageField(
		upload_to='profile/images/',
		null=True,
		default=None,
		blank=True,
		verbose_name='Фото'
	)

	is_customer = models.BooleanField(default=False)
	is_worker = models.BooleanField(default=False)
	is_moderator = models.BooleanField(default=False)

	is_moderated = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	is_admin = models.BooleanField(default=False)
	# is_superuser = models.BooleanField(default=False)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	objects = UserManager()

	USERNAME_FIELD = 'login'
	REQUIRED_FIELDS = ['display_name', 'password']

	def __str__(self):
		return self.display_name

	def has_perm(self, perm, obj=None):
		return True

	def has_module_perms(self, app_label):
		return True

	@property
	def is_staff(self):
		return self.is_admin

	@property
	def is_superuser(self):
		return self.is_admin

	@classmethod
	def has_customer_permission(cls, user_id):
		member = cls.objects.filter(id=user_id)
		if len(member) == 0:
			return HttpResponse(status=404)
		if member[0].is_worker:
			return HttpResponse(status=403)
		return member


User = get_user_model()


class Contact(models.Model):
	user = models.ForeignKey(to=Member, on_delete=models.CASCADE)
	type = models.CharField(
		choices=CONTACT_TYPE,
		max_length=150,
	)
	value = models.CharField(
		max_length=150,
		verbose_name='Контакт'
	)
	preferred = models.BooleanField(
		default=False,
		verbose_name='Предпочитаемый вид контакта'
	)

	def __str__(self):
		return f'{self.type} {self.value} {self.preferred}'

	@classmethod
	def is_current_user(cls, _id, user):
		resume = cls.objects.get(_id)
		return resume.user == user.id

	class Meta:
		verbose_name = 'Контакт'
		verbose_name_plural = 'Контакты'


class Industry(models.Model):
	name = models.CharField(
		max_length=255,
		verbose_name='Отрасль'
	)
	slug = models.CharField(
		max_length=255,
		verbose_name='alt',
		null=True,
		default=None
	)
	icon = models.CharField(
		max_length=100,
		verbose_name='icon',
		blank=True,
		null=True,
		default=''
	)

	class Meta:
		ordering = ('-name',)
		verbose_name = 'Отрасль'
		verbose_name_plural = 'Отрасль'

	def __str__(self):
		return self.name


class Specialisation(models.Model):
	"""
	Специализации.
	"""
	name = models.CharField(
		verbose_name='Название Профессия',
		max_length=250
	)

	slug = models.CharField(
		max_length=255,
		verbose_name='alt',
		null=True,
		default=None
	)
	icon = models.CharField(
		max_length=100,
		verbose_name='icon',
		blank=True,
		null=True,
		default=''
	)
	industry = models.ForeignKey(to=Industry, verbose_name="Отрасль", on_delete=models.CASCADE, null=True, default=None)

	class Meta:
		ordering = ('-name',)
		verbose_name = 'Профессия'
		verbose_name_plural = 'Профессия'

	def __str__(self):
		return self.name


class Company(models.Model):
	user = models.OneToOneField(
		Member,
		on_delete=models.PROTECT
	)
	logo = models.ImageField(
		upload_to='company/images/',
		null=True,
		default=None,
		blank=True,
		verbose_name='Фото или логотип'
	)
	email = encrypt(models.EmailField(
		verbose_name='публичный email для связи',
		max_length=254,
		db_index=True,
		null=True,
		blank=True,
		unique=True,
	))
	name = models.CharField(
		max_length=150,
		verbose_name='Название компании или ваше имя'
	)

	about = CKEditor5Field(
		blank=True,
		verbose_name='О себе', config_name='extends'
	)
	web = models.URLField(
		blank=True,
		verbose_name='Личный сайт'
	)

	is_moderated = models.BooleanField(verbose_name="Прошёл модерацию", default=False, blank=True)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	class Meta:
		ordering = ('-name',)
		verbose_name = 'Company'
		verbose_name_plural = 'Companies'

	def __str__(self):
		return self.name


class CustomerReview(models.Model):
	company = models.ForeignKey(
		Company,
		on_delete=models.CASCADE,
		related_name='review_company',
		default=None,
		null=True,
		unique=False
	)
	reviewer = models.ForeignKey(
		Member,
		related_name='review_reviewer',
		on_delete=models.CASCADE,
		default=None,
		null=True,
		unique=False

	)
	comment = models.TextField(
		max_length=500,
		verbose_name='Комментарий'
	)
	rating = models.IntegerField(verbose_name='Оценка', null=True, default=5)
	pub_date = models.DateTimeField(
		auto_now_add=True,
		verbose_name='Дата публикации вакансии',
	)
	moderated = models.BooleanField(verbose_name='Прошёл модерацию', default=False)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	@classmethod
	def get_top_companies(cls, limit):
		result = []
		res = cls.objects.values('company').annotate(avg_rating=Avg('rating'))
		for item in res:
			company = Company.objects.get(id=item['company'])
			result.append({'company': company, 'rating': item['avg_rating']})
		return result

	@classmethod
	def get_company_rating(cls, company_id):
		res = cls.objects.values('company').annotate(avg_rating=Avg('rating')).filter(company_id=company_id,
																					  moderated=True)
		if len(res) == 0:
			res = 0
		else:
			res = round(res[0]["avg_rating"], 1)
		return res

	@classmethod
	def get_company_reviews(cls, company_id, moderated=True):
		return cls.objects.filter(company_id=company_id, moderated=moderated)


class Resume(models.Model):
	class Meta:
		verbose_name = 'Резюме пользователя'
		verbose_name_plural = 'Резюме пользователей'

	name = models.CharField(null=False, max_length=255, verbose_name='Наименование должности', default='')
	description = models.CharField(null=False, max_length=255, verbose_name='Описание должности', default='')
	user = models.ForeignKey(to=Member,
							 on_delete=models.CASCADE,
							 related_name='f_resume_member',
							 verbose_name='Пользователь')
	specialisation = models.ForeignKey(to=Specialisation,
									   on_delete=models.SET_DEFAULT,
									   default=None,
									   null=True,
									   related_name='f_resume_stack',
									   verbose_name='Профессия')
	active_search = models.BooleanField(null=True, default=True, verbose_name='В активном поиске')
	salary = models.IntegerField(verbose_name='Желаемая заработная плата', null=True, default=0)
	deposit = models.IntegerField(verbose_name='Залог', null=True, default=0)
	work_experience = models.IntegerField(verbose_name='Опыт работы (месяцы)', null=True, default=0)
	is_offline = models.BooleanField(verbose_name='Оффлайн работа', null=False, default=False)
	is_fulltime = models.BooleanField(verbose_name='Полная занятость', null=False, default=False)
	moderated = models.BooleanField(verbose_name='Прошёл модерацию', default=True)
	views = models.IntegerField(verbose_name='просмотры', null=True, default=0, blank=True)
	region = models.ForeignKey(verbose_name='Регион работы',
							   to=Region,
							   null=True,
							   default=None,
							   on_delete=models.SET_DEFAULT)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	@classmethod
	def is_current_user(cls, _id, user):
		resume = cls.objects.get(_id)
		return resume.user == user.id

	@classmethod
	def join_invites(cls, objs, user):
		resumes_ids = []
		for resume in objs:
			resumes_ids.append(resume.id)
		job_responses = ResponseInvite.objects.filter(resume_id__in=resumes_ids, job__company__user=user).values()
		for resume in objs:
			for job_response in job_responses:
				if resume.id == job_response["resume_id"]:
					resume.status = job_response["status"]
					resume.type = job_response["type"]
					resume.request_invite_id = job_response["id"]
		return objs

	def increase_views(self):
		self.views = self.views + 1
		self.save()

	def __str__(self):
		return self.name

	@classmethod
	def search_filter(cls, request, limit):
		_get = request.GET
		print(_get)
		objs = cls.objects
		filters_exists = False
		if "name" in _get and _get["name"] != '':
			filters_exists = True
			objs = objs.filter(Q(name__icontains=_get["name"]) | Q(specialisation__name__icontains=_get["name"]))
		if "work_type" in _get and _get["work_type"] != '3':
			filters_exists = True
			if _get["work_type"] == '2':
				objs = objs.filter(is_offline=False)
			if _get["work_type"] == '1':
				objs = objs.filter(is_offline=True)
		if "work_time_busy" in _get and _get["work_time_busy"] != '3':
			filters_exists = True
			if _get["work_time_busy"] == '2':
				objs = objs.filter(is_fulltime=False)
			if _get["work_time_busy"] == '1':
				objs = objs.filter(is_fulltime=True)
		if "work_deposit" in _get and _get["work_deposit"] != '2':
			filters_exists = True
			if _get["work_deposit"] == '1':
				objs = objs.filter(deposit__gte=0)
		if "salary_to" in _get and _get["salary_to"] != '':
			filters_exists = True
			objs = objs.filter(salary__gt=0).filter(salary__lte=_get["salary_to"])
		if "deposit" in _get and _get["deposit"] != '':
			filters_exists = True
			objs = objs.filter(deposit__gte=_get["deposit"])
		if "work_experience" in _get and _get["work_experience"] != 'NoMatter':
			filters_exists = True
			if _get["work_experience"] == 'WithoutExperience':
				objs = objs.filter(work_experience=0)
			if _get["work_experience"] == 'Between1And6':
				objs = objs.filter(work_experience__gte=1, work_experience__lte=6)
			if _get["work_experience"] == 'Between6And12':
				objs = objs.filter(work_experience__gte=6, work_experience__lte=12)
		if "specialisation" in _get and _get["specialisation"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__in=request.GET.getlist("specialisation"))
		if "region" in _get and _get["region"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__in=request.GET.getlist("region"))

		if not filters_exists:
			return cls.objects.filter(moderated=True, active_search=True).order_by('-id')[:limit]
		else:
			return objs.filter(moderated=True, active_search=True).order_by('-id')[:limit]


class Job(models.Model):
	"""
	Размещение заказов заказчиком.
	"""
	title = models.CharField(
		verbose_name='Название вакансии', max_length=200
	)
	specialisation = models.ForeignKey(
		Specialisation,
		related_name='jobs',
		verbose_name='Специализация',
		null=True,
		default=None,
		help_text='Выберите специализацию',
		on_delete=models.CASCADE
	)
	company = models.ForeignKey(
		Company,
		related_name='job_company',
		verbose_name='Компания',
		default=None,
		blank=True,
		null=True,
		on_delete=models.PROTECT
	)
	description = CKEditor5Field(
		verbose_name='Описание вакансии', config_name='extends'
	)
	salary = models.BigIntegerField(
		default=0,
		verbose_name='Зарплата'
	)
	salary_from = models.BigIntegerField(
		default=0,
		verbose_name='Зарплата от'
	)
	salary_to = models.BigIntegerField(
		default=0,
		verbose_name='Зарплата до'
	)

	work_experience = models.IntegerField(
		default=0,
		verbose_name='Опыт работы в месяцах'
	)
	is_offline = models.BooleanField(verbose_name='Оффлайн работа', null=False, default=False)
	is_fulltime = models.BooleanField(verbose_name='Полная занятость', null=False, default=False)
	region = models.ManyToManyField(Region, verbose_name='Регион работы',  default=None, blank=True)
	active_search = models.BooleanField(null=True, blank=True, default=True, verbose_name='В активном поиске')
	deposit = models.IntegerField(verbose_name='Залог', null=True, default=0)
	views = models.IntegerField(verbose_name='Просмотры', null=True, default=0)

	pub_date = models.DateTimeField(
		auto_now_add=True,
		verbose_name='Дата публикации вакансии',
	)
	moderated = models.BooleanField(verbose_name='Прошёл модерацию', default=True)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	class Meta:
		ordering = ('-id',)
		verbose_name = 'Вакансия'
		verbose_name_plural = 'Вакансии'

	def __str__(self):
		return self.title

	@property
	def regions_name(self):
		regions = self.region.all()
		return regions

	def increase_views(self):
		self.views = self.views + 1
		self.save()

	@property
	def busy_type(self):
		str = ''
		if self.is_offline:
			str = 'Оффлайн занятость'
		else:
			str = 'Онлайн занятость'
		regions = self.region.all()
		regions_str = ''
		if len(regions):
			regions_str = ': '
		index = 0

		for region in regions:
			if index > 2:
				length = len(regions) - index
				regs = []
				for _region in regions:
					regs.append(_region.name)
				btn_content = f'<a tabindex="0"  role="button" class="regions-expand" data-bs-container="body" data-bs-trigger="click" data-bs-toggle="popover" data-bs-placement="right" data-bs-content="{", ".join(regs)}">и еще {length}</button>'
				return str + regions_str + btn_content
			if index == 0:
				regions_str = regions_str + f'{region.name}'
			else:
				regions_str = regions_str + f', {region.name}'
			index += 1
		return str + regions_str

	@property
	def final_salary(self):
		if self.salary > 0:
			return self.salary
		else:
			if self.salary_from and self.salary_to:
				return f'{self.salary_from} - {self.salary_to}'
			else:
				if self.salary_from > 0:
					return f' от {self.salary_from}'
				else:
					return f'до {self.salary_to}'

	@classmethod
	def is_current_user(cls, _id, user):
		obj = cls.objects.get(_id)
		return obj.user == user.id

	@classmethod
	def get_new_jobs(cls, limit):
		return cls.objects.all().order_by('-id')[:limit]

	@classmethod
	def get_hot_jobs(cls, limit):
		return cls.objects.all().order_by('-id')[:limit]

	@classmethod
	def search_filter(cls, request, limit):
		_get = request.GET
		print(_get)
		objs = cls.objects
		filters_exists = False
		if "title" in _get and _get["title"] != '':
			filters_exists = True
			objs = objs.filter(Q(title__icontains=_get["title"]) | Q(specialisation__name__icontains=_get["title"]) | Q(
				specialisation__industry__name__icontains=_get["title"]))
		if "salary_from" in _get and _get["salary_from"] != '':
			filters_exists = True
			objs = objs.filter(Q(salary__gt=0) | Q(salary_from__gt=0)).filter(
				Q(salary__gte=_get["salary_from"]) | Q(salary_from__gte=_get["salary_from"]))
		if "work_type" in _get and _get["work_type"] != '3':
			filters_exists = True
			if _get["work_type"] == '2':
				objs = objs.filter(is_offline=False)
			if _get["work_type"] == '1':
				objs = objs.filter(is_offline=True)
		if "work_time_busy" in _get and _get["work_time_busy"] != '3':
			filters_exists = True
			if _get["work_time_busy"] == '2':
				objs = objs.filter(is_fulltime=False)
			if _get["work_time_busy"] == '1':
				objs = objs.filter(is_fulltime=True)
		if "work_deposit" in _get and _get["work_deposit"] != '2':
			filters_exists = True
			if _get["work_deposit"] == '1':
				objs = objs.filter(deposit__gte=0)
		if "deposit" in _get and _get["deposit"] != '':
			filters_exists = True
			objs = objs.filter(deposit__lte=_get["deposit"])
		if "work_experience" in _get and _get["work_experience"] != 'NoMatter':
			filters_exists = True
			if _get["work_experience"] == 'WithoutExperience':
				objs = objs.filter(work_experience=0)
			if _get["work_experience"] == 'Between1And6':
				objs = objs.filter(work_experience__gte=1, work_experience__lte=6)
			if _get["work_experience"] == 'Between6And12':
				objs = objs.filter(work_experience__gte=6, work_experience__lte=12)
		if "specialisation" in _get and _get["specialisation"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__in=request.GET.getlist("specialisation"))
		if "region" in _get and _get["region"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__in=request.GET.getlist("region"))

		if not filters_exists:
			return cls.objects.filter(moderated=True, active_search=True).order_by('-id')[:limit]
		else:
			return objs.filter(moderated=True, active_search=True).order_by('-id')[:limit]


	@classmethod
	def join_invites(cls, objs, user):
		jobs_ids = []
		for job in objs:
			jobs_ids.append(job.id)
		job_responses = ResponseInvite.objects.filter(job_id__in=jobs_ids, resume__user=user).values()
		for job in objs:
			for job_response in job_responses:
				if job.id == job_response["job_id"]:
					job.status = job_response["status"]
					job.type = job_response["type"]
					job.request_invite_id = job_response["id"]
		return objs


class ResponseInvite(models.Model):
	job = models.ForeignKey(
		Job,
		related_name='response_invite_job',
		on_delete=models.CASCADE,
		unique=False
	)
	resume = models.ForeignKey(
		Resume,
		related_name='response_invite_resume',
		on_delete=models.CASCADE,
		unique=False
	)

	type = models.IntegerField()
	status = models.IntegerField()

	create_date = models.DateTimeField(
		auto_now_add=True,
		verbose_name='Дата публикации вакансии',
	)

	answer_date = models.DateTimeField(
		auto_now_add=False,
		verbose_name='Дата ответа на отклик\приглашение',
		blank=True,
		null=True,
		default=None
	)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	def set_deleted(self):
		self.deleted_at = datetime.datetime.now()
		self.deleted = True
		self.save()
		return True

	@classmethod
	def filter_search(cls, objs, order="desc", status=1, type='any', page=1, limit=10):
		order_z = ''
		if order == 'desc':
			order_z = '-'
		if type != 'any' and type != '':
			objs = objs.filter(type=type).order_by(order_z + 'create_date')
		else:
			objs = objs.filter(status=status).order_by(order_z + 'create_date')
		return objs[(page - 1) * limit: limit]

	@classmethod
	def update_response_invite(self, id, user, status):
		try:
			if user.is_customer:
				request = ResponseInvite.objects.get(id=int(id), job__company__user=user)
			else:
				request = ResponseInvite.objects.get(id=int(id), resume__user=user)
			request.status = int(status)
			request.save()
			return request
		except Exception as e:
			print(e)
			return False

	@classmethod
	def get_by_user(cls, user):
		if user.is_worker:
			return cls.objects.filter(resume__user_id=user.id)
		else:
			return cls.objects.filter(job__company__user_id=user.id)

	@classmethod
	def create_invite(cls, user: User, job_id: int, resume_id: int) -> bool:
		try:
			user_job = Job.objects.get(company__user=user, id=job_id)
			invite = ResponseInvite.objects.filter(resume_id=resume_id, job_id=job_id)

			if len(invite):
				# Отклик уже существует
				return False
			invite = ResponseInvite(resume_id=resume_id, job_id=job_id, type=RESPONSE_INVITE_TYPE["INVITE"],
									status=RESPONSE_INVITE_STATUS["WAIT_FOR_ACCEPT"])
			invite.save()
			return True
		except Exception as e:
			print(e)
			return False

	@classmethod
	def create_response(cls, user: User, job_id: int, resume_id: int) -> bool:
		try:
			user_resume = Resume.objects.get(user=user, id=resume_id)
			invite = ResponseInvite.objects.filter(resume_id=resume_id, job_id=job_id)

			if len(invite):
				# Отклик уже существует
				return False
			response = ResponseInvite(resume_id=resume_id, job_id=job_id, type=RESPONSE_INVITE_TYPE["RESPONSE"],
									  status=RESPONSE_INVITE_STATUS["WAIT_FOR_ACCEPT"])
			response.save()
			return True
		except Exception as e:
			print(e)
			return False
