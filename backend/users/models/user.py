import datetime


from django.contrib.auth.hashers import make_password
import random
import string
from django.forms import ModelForm
from django.utils import timezone
from django.http import HttpResponse
from django_ckeditor_5.fields import CKEditor5Field
from django.db import models
from django.db.models import Sum, Count, Avg
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models import Q
import random
from contract.settings import CONTACT_TYPE, RESPONSE_INVITE_TYPE, RESPONSE_INVITE_STATUS, CHOICES_WORK_EXPERIENCE, \
	CHOICES_WORK_TYPE, CHOICES_WORK_TIMEWORK, CHOICES_TICKET_STATUS
from .common import Region
from users.usermanager import UserManager
from django_cryptography.fields import encrypt
from contract.settings import USER_FILE_TYPE
from os import path
from django.db.models import Manager

class UserFile(models.Model):
	folder = models.CharField(max_length=255, null=True, blank=True)
	name = models.CharField(max_length=255, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True, db_index=True)
	file_type = models.IntegerField(null=False, default=0,  choices=USER_FILE_TYPE)
 
	class Meta:
		verbose_name = 'Файл'
		verbose_name_plural = 'Файлы'


	def __str__(self):
		return str(self.name)

	@property
	def logo(self):
		return path.join( self.folder , self.name)
	
	@property
	def photo(self):
		return path.join( self.folder , self.name)


class Member(PermissionsMixin, AbstractBaseUser):
	login = models.CharField(
		verbose_name='Логин пользователя',
		max_length=254,
		db_index=True,
		unique=True,
		null=True
	)

	display_name = models.CharField(
		verbose_name='Отображаемое имя',
		max_length=254,
		unique=True,
		default='',
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
	photo = models.OneToOneField(
		to=UserFile,
		default='',
		blank=True,
		null=True,
		on_delete=models.PROTECT
	)

	recovery_code = models.CharField(max_length=255, blank=True, null=True, unique=True)
	is_customer = models.BooleanField(default=False)
	is_worker = models.BooleanField(default=False)
	is_moderator = models.BooleanField(default=False)

	is_moderated = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	is_admin = models.BooleanField(default=False)
	# is_superuser = models.BooleanField(default=False)

	created_at = models.DateTimeField(default=timezone.now)
	updated_at = models.DateTimeField(auto_now=True)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	objects = UserManager()
	groups = models.ManyToManyField(
		to='auth.Group',
		blank=True,
		related_name='user_set',
		related_query_name='user',
		verbose_name='groups',
		help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
	)

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
	

	def make_random_password(self):
		characters = string.ascii_letters + string.digits + string.punctuation
		password = ''.join(random.choice(characters) for i in range(12))
		self.password =  make_password(password)
		self.save()
		return password



User = get_user_model()
#define new method get_member from user model
User.get_member = lambda self: Member.objects.get(id=self.id)


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
	def update_company_contacts(cls, user, items):
		cls.objects.filter(user=user).delete()
		for item in items:
			if item != '':
				cls.objects.create(user=user, value=item, type='other')

	@classmethod
	def get_company_links(cls, user):
		return cls.objects.filter(user=user, type='other')

	@classmethod
	def is_current_user(cls, _id, user):
		resume = cls.objects.get(_id)
		return resume.user == user.id

	@classmethod
	def get_company_contacts(cls, company_id):
		return cls.objects.filter(user__company=company_id).values()

	@classmethod
	def get_worker_contacts(cls, user_id):
		return cls.objects.filter(user=user_id).values()

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

from django.core.files import File



class Company(models.Model):
	user = models.OneToOneField(
		Member,
		on_delete=models.PROTECT
	)
	logo = models.OneToOneField(
		UserFile,
  		default='',
		blank=True,
		null=True,
		on_delete=models.PROTECT
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

	moderated = models.BooleanField(verbose_name="Прошёл модерацию", default=False, blank=True)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)

	class Meta:
		ordering = ('-name',)
		verbose_name = 'Company'
		verbose_name_plural = 'Companies'

	def __str__(self):
		return self.name

	def get_different_fields_as_str(self,moderated_obj):
		return  str({"name": self.name, "web": self.web, "logo": self.logo} ^ moderated_obj.__dict__.items())

	def updateModeratedFields(self, moderated_obj):
		try:
			if 'name' in moderated_obj :
				self.name = moderated_obj['name']['value']
			if 'logo' in moderated_obj:
				self.logo.save(moderated_obj['logo']['value'].split('/')[-1], File(open('./media/'+moderated_obj['logo']['value'], 'rb')))
			self.save()
		except Exception as e:
			print(e)
  
	def get_owner(self):
		return self.user

	@classmethod
	def join_companies(cls, objs):
		companies_ids = []
		for job in objs:
			companies_ids.append(job.company_id)
		return cls.objects.filter(id__in=companies_ids).values()

	@classmethod
	def join_company(cls, job):
		return cls.objects.get(id=job.company_id).values()

	@classmethod
	def get_active_company(cls, id):
		return cls.objects.filter(id=id, moderated=True, deleted=False)



class Ticket( models.Model):
	question = models.CharField(null=False, max_length=255)
	owner = models.ForeignKey(to=User, on_delete=models.CASCADE, null=True)
	created_at = models.DateTimeField(auto_now_add=True, db_index=True)
	updated_at = models.DateTimeField(auto_now=True)
	status = models.IntegerField(null=False, default=0,  choices=CHOICES_TICKET_STATUS)
	class Meta:
		verbose_name = 'Тикет'
		verbose_name_plural = 'Тикеты'

	def __str__(self):
		return self.question


class CompanyHistory(models.Model):

	logo = models.ImageField(
		upload_to='company/images/',
		null=True,
		default=None,
		blank=True,
		verbose_name='Фото или логотип'
	)

	name = models.CharField(
		max_length=150,
		verbose_name='Название компании или ваше имя'
	)

	web = models.URLField(
		blank=True,
		verbose_name='Личный сайт'
	)
	
	original_object = models.ForeignKey(
		to=Company,
		on_delete=models.CASCADE,
		verbose_name='Компания',
		related_name='original_company',
		default=None,
		null=True,
		blank=True
	)


	def __str__(self):
		if self.original_object:
			return self.original_object.name
		return self.name

	class Meta:
		ordering = ('-name',)
		verbose_name = 'CompanyHistory'
		verbose_name_plural = 'CompaniesHistories'


class CustomerReview(models.Model):
	worker = models.ForeignKey(
		Member,
		on_delete=models.CASCADE,
		related_name='review_worker',
		default=None,
  		blank=True,
		null=True,
		verbose_name='Работник',
		unique=False
	)
	company = models.ForeignKey(
		Company,
		on_delete=models.CASCADE,
		related_name='review_company',
		default=None,
		null=True,
  		blank=True,
		verbose_name='Компания',
		unique=False
	)
	reviewer = models.ForeignKey(
		Member,
		related_name='review_reviewer',
		on_delete=models.CASCADE,
		default=None,
		null=True,
  		verbose_name='Ревьюер',
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
 
	def __str__(self):
		return 'review: ' + str(self.id)

	def get_owner(self):
		return self.reviewer

	@classmethod
	def get_top_companies(cls, limit):
		result = []
		res = cls.objects.values('company').annotate(avg_rating=Avg('rating'))
		for item in res:
			if item['company'] is not None:
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
	def get_company_reviews(cls, company_id, moderated=True, page=0, limit=1000000):
		count =  len(cls.objects.filter(company_id=company_id, moderated=moderated))
		reviews = cls.objects.filter(company_id=company_id, moderated=moderated).order_by('-id')[page*limit:page*limit + limit]
		return count, reviews

	@classmethod
	def get_worker_reviews(cls, user_id, moderated=True, page=0, limit=1000000):
		count =  len(cls.objects.filter(worker=user_id, moderated=moderated))
		reviews = cls.objects.filter(worker=user_id, moderated=moderated).order_by('-id')[page*limit:page*limit + limit]
		return count, reviews



class Resume(models.Model):
	class Meta:
		verbose_name = 'Резюме пользователя'
		verbose_name_plural = 'Резюме пользователей'

	name = models.CharField(null=False, max_length=255, verbose_name='Заголовок резюме', default='')
	user = models.ForeignKey(to=Member,
							 on_delete=models.CASCADE,
							 related_name='f_resume_member',
							 verbose_name='Пользователь')
	specialisation = models.ForeignKey(to=Specialisation,
									   on_delete=models.SET_DEFAULT,
									   default=None,
									   null=True,
									   related_name='f_resume_stack',
									   verbose_name='Специализация')

	active_search = models.BooleanField(null=True, default=True, verbose_name='В активном поиске')
	salary = models.IntegerField(verbose_name='Желаемый уровень дохода', null=True, default=0)
	deposit = models.IntegerField(verbose_name='Залог', null=True, default=0)
	work_experience = models.CharField(verbose_name='Опыт работы', choices=CHOICES_WORK_EXPERIENCE,
									   default="NoMatter",
									   null=True,
									   blank=True, )

	is_offline = models.BooleanField(verbose_name='Оффлайн работа', null=False, default=False, choices=CHOICES_WORK_TYPE)
	is_fulltime = models.BooleanField(verbose_name='Полная занятость', null=False, default=False, choices=CHOICES_WORK_TIMEWORK)
	moderated = models.BooleanField(verbose_name='Прошёл модерацию', default=True)
	views = models.IntegerField(verbose_name='просмотры', null=True, default=0, blank=True)
	region = models.ManyToManyField(Region, verbose_name='Регион работы', default=None, blank=True)
	description = CKEditor5Field(
		verbose_name='Расскажите о себе', config_name='extends', null=True,
		blank=True,
	)
	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)



	def set_deleted(self):
		self.deleted_at = datetime.datetime.now()
		self.deleted = True
		self.save()
		return True

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

	@classmethod
	def get_active_resume(cls, id):
		return cls.objects.filter(id=int(id), moderated=True, active_search=True, deleted=False)

	def increase_views(self):
		self.views = self.views + 1
		self.save()

	def __str__(self):
		return self.name

	@classmethod
	def search_filter(cls, request):

		_get = request.POST
		now = datetime.datetime.now()
		limit = 1
		page = 0
		if "page" in _get:
			page = int(_get["page"])
		if "limit" in _get:
			limit = int(_get["limit"])
		objs = cls.objects
		filters_exists = False
		if "company_id" in _get and _get["company_id"] != '':
			filters_exists = True
			objs = objs.filter(company_id=_get["company_id"])
		if "title" in _get and _get["title"] != '':
			filters_exists = True
			objs = objs.filter(Q(title__icontains=_get["title"]) | Q(specialisation__name__icontains=_get["title"]) | Q(
				specialisation__industry__name__icontains=_get["title"]))
		if "salary_to" in _get and _get["salary_to"] != '':
			filters_exists = True
			objs = objs.filter(salary__lte=_get["salary_to"])
		if "work_type" in _get and _get["work_type"] != '3':
			filters_exists = True
			if _get["work_type"] == '2':
				objs = objs.filter(is_offline=False)
			if _get["work_type"] == '1':
				objs = objs.filter(is_offline=True)
			if "region" in _get and _get["region"] != '':
				filters_exists = True
				print([int(x) for x in _get.getlist("region")])
				objs = objs.filter(region__in=[int(x) for x in _get.getlist("region")]).order_by('id')
			if "region[]" in _get and _get["region[]"] != '':
				filters_exists = True
				objs = objs.filter(region__in=_get.getlist("region[]")).order_by('id')
		if "work_time_busy" in _get and _get["work_time_busy"] != '3':
			filters_exists = True
			if _get["work_time_busy"] == '2':
				objs = objs.filter(is_fulltime=False)
			if _get["work_time_busy"] == '1':
				objs = objs.filter(is_fulltime=True)
		if "work_deposit" in _get:
			filters_exists = True
			if _get["work_deposit"] == '2':
				objs = objs.filter(deposit=0)
			if _get["work_deposit"] == '1':
				objs = objs.filter(deposit__gt=0)
		if "deposit" in _get and _get["deposit"] != '':
			filters_exists = True
			objs = objs.filter(deposit__gte=_get["deposit"])
		if "work_experience" in _get and _get["work_experience"] != 'NoMatter':
			filters_exists = True
			objs = objs.filter(work_experience=_get["work_experience"])
		if "specialisation[]" in _get and _get["specialisation[]"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__industry_id__in=_get.getlist("specialisation[]"))
		if "specialisation" in _get and _get["specialisation"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__industry_id=_get["specialisation"])


		if not filters_exists:
			obj_count = len(cls.objects.filter(moderated=True, deleted=False, active_search=True).order_by('-id').distinct())
			objs = cls.objects.filter(moderated=True, deleted=False, active_search=True).order_by('-id').distinct()[
				   page*limit:page*limit + limit]
			return obj_count, objs
		else:
			obj_count = len(objs.filter(moderated=True,  deleted=False, active_search=True).order_by('-id').distinct())
			objs =  objs.filter(moderated=True,  deleted=False, active_search=True).order_by('-id').distinct()[page*limit:page*limit + limit]
			return obj_count, objs


class Job(models.Model):
	related_objects = models.Manager()
	objects = related_objects
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
		verbose_name='Описание вакансии', config_name='extends', null=True,
		blank=True,
	)
	salary_from = models.BigIntegerField(
		default=0,
		null=True,
		blank=True,
		verbose_name='Зарплата от'
	)
	salary_to = models.BigIntegerField(
		default=0,
		null=True,
		blank=True,
		verbose_name='Зарплата до'
	)

	work_experience = models.CharField(verbose_name='Опыт работы в месяцах', choices=CHOICES_WORK_EXPERIENCE,
									   default="NoMatter",
									   null=True,
									   blank=True,)

	is_offline = models.BooleanField(verbose_name='Оффлайн работа', null=False, default=False)
	is_fulltime = models.BooleanField(verbose_name='Полная занятость', null=False, default=False)
	region = models.ManyToManyField(Region, verbose_name='Регион работы', default=None, blank=True)
	active_search = models.BooleanField(blank=True, default=True, verbose_name='В активном поиске')
	deposit = models.IntegerField(verbose_name='Залог',  default=0, blank=True)
	views = models.IntegerField(verbose_name='Просмотры', null=True, default=0)

	pub_date = models.DateTimeField(
		default=timezone.now,
		verbose_name='Дата публикации вакансии',
	)
	moderated = models.BooleanField(verbose_name='Прошёл модерацию', default=False)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)
	pseudo_tier_order = models.IntegerField(verbose_name='Порядок выдачи для тарифов', null=True, default=0, blank=True)

	class Meta:
		ordering = ('-id',)
		verbose_name = 'Вакансия'
		verbose_name_plural = 'Вакансии'

	def __str__(self):
		return self.title

	def updateModeratedFields(self, moderated_obj):
		if 'title' in moderated_obj :
			self.title = moderated_obj['title']['value']
		if 'description' in moderated_obj :
			self.description = moderated_obj['description']['value']
		self.save()

	@property
	def regions_name(self):
		regions = self.region.all()
		return regions

	def set_deleted(self):
		self.deleted_at = datetime.datetime.now()
		self.deleted = True
		self.save()
		return True

	def increase_views(self):
		self.views = self.views + 1
		self.save()

	@property
	def tier_name(self):
		payments = self.jobpayment_set.filter().order_by('-expire_at')[:1]
		if len(payments):
			payment = payments[0]
			return payment.job_tier.name
		else:
			return 'Не оплачен'

	@property
	def payment_expire(self):
		payments = self.jobpayment_set.filter().order_by('-expire_at')[:1]
		if len(payments):
			payment = payments[0]
			return payment.expire_at
		else:
			return 'Не был оплачен'

	def get_existing_payment(self):
		now = datetime.datetime.now()
		payments = self.jobpayment_set.filter(expire_at__lte=now)
		if len(payments):
			return payments[0]
		else:
			return False

	@property
	def responses_count(self):
		return ResponseInvite.objects.filter(job_id=self.id, type=0).count()

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
		if self.salary_from is None:
			self.salary_from = 0
		if self.salary_to is None:
			self.salary_to = 0
		if self.salary_from and self.salary_to:
			return f'{self.salary_from:_} - {self.salary_to:_}'.replace('_', ' ')
		else:
			if self.salary_from != 0:
				return f'от {self.salary_from:_}'.replace('_', ' ')
			if self.salary_to != 0:
				return f'до {self.salary_to:_}'.replace('_', ' ')
			return 'Не указана'

	@classmethod
	def is_current_user(cls, _id, user):
		obj = cls.objects.get(_id)
		return obj.user == user.id

	@classmethod
	def get_new_jobs(cls, limit):
		return cls.objects.filter( jobpayment__start_at__lte=timezone.now(), moderated=True, deleted=False, active_search=True,
								  jobpayment__expire_at__gte=timezone.now()).order_by('-id')[:limit]

	@classmethod
	def get_active_job(cls, id):
		return cls.objects.filter(id=id, deleted=False)

	@classmethod
	def get_paid_job(cls, id):
		return cls.objects.filter(id=id, jobpayment__start_at__lte=timezone.now(), moderated=True, deleted=False, active_search=True,
								  jobpayment__expire_at__gte=timezone.now())

	@classmethod
	def get_hot_jobs(cls, limit):
		items = list(cls.objects.filter(jobpayment__job_tier_id=3, jobpayment__start_at__lte=timezone.now(),
										moderated=True, deleted=False,active_search=True,
								  jobpayment__expire_at__gte=timezone.now()).order_by('-id'))
		if len(items) <3:
			return items
		random_items = random.sample(items, 3)
		return random_items

	@classmethod
	def up_tier_two(cls):

		cls.objects.filter(jobpayment__job_tier_id=2, pub_date__lt=timezone.now(),
						   jobpayment__expire_at__gte=timezone.now()).update(pub_date=timezone.now())

	@property
	def is_hot(self):
		res = self.jobpayment_set.filter(job_tier_id=3, start_at__lte=timezone.now(),
										 expire_at__gte=timezone.now())
		if len(res):
			return True
		else:
			return False

	@classmethod
	def down_tier_two(cls):

		cls.objects.filter(jobpayment__job_tier_id=2, jobpayment__start_at__lte=timezone.now(),
						   jobpayment__expire_at__gte=timezone.now()).update(pseudo_tier_order=0)

	@classmethod
	def search_filter(cls, request, limit):
		_get = request.GET
		now = datetime.datetime.now()
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
		if "work_deposit" in _get:
			filters_exists = True
			if _get["work_deposit"] == '2':
				objs = objs.filter(deposit=0)
			if _get["work_deposit"] == '1':
				objs = objs.filter(deposit__gt=0)
		if "deposit" in _get and _get["deposit"] != '':
			filters_exists = True
			objs = objs.filter(deposit__lte=_get["deposit"])
		if "work_experience" in _get and _get["work_experience"] != 'NoMatter':
			filters_exists = True
			objs = objs.filter(work_experience=_get["work_experience"])
		if "specialisation" in _get and _get["specialisation"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__in=request.GET.getlist("specialisation"))
		if "region" in _get and _get["region"] != '':
			filters_exists = True
			objs = objs.filter(specialisation__in=request.GET.getlist("region"))

		if not filters_exists:
			return cls.objects.filter(moderated=True, active_search=True, jobpayment__start_at__lte=timezone.now(),
									  jobpayment__expire_at__gte=timezone.now()).order_by('-jobpayment__job_tier_id',
																						  '-pseudo_tier_order', '-id')[
				   :limit]
		else:
			return objs.filter(moderated=True, active_search=True, jobpayment__start_at__lte=timezone.now(),
							   jobpayment__expire_at__gte=timezone.now()).order_by('-jobpayment__job_tier_id',
																				   '-pseudo_tier_order', '-id')[:limit]

	@classmethod
	def search_filter_new(cls, request):

		_get = request.POST
		now = datetime.datetime.now()
		limit = 1
		page = 0
		if "own" in _get:
			count = len(Job.objects.filter(company__user=request.user))
			res = Job.objects.filter(company__user=request.user)

			return count, res

		if "page" in _get:
			page = int(_get["page"])
		if "limit" in _get:
			limit = int(_get["limit"])
		objs = cls.objects
		filters_exists = False
		if "company_id" in _get and _get["company_id"] != '':
			filters_exists = True
			objs = objs.filter(company_id=_get["company_id"])
		if "title" in _get and _get["title"] != '':
			filters_exists = True
			objs = objs.filter(Q(title__icontains=_get["title"]) | Q(specialisation__name__icontains=_get["title"]) | Q(
				specialisation__industry__name__icontains=_get["title"]))
		if "salary_from" in _get and _get["salary_from"] != '':
			filters_exists = True
			objs = objs.filter(Q(salary_from__lte=_get["salary_from"]) | Q(salary_to__gte=_get["salary_from"]))
		if "work_type" in _get and _get["work_type"] != '3':
			filters_exists = True
			if _get["work_type"] == '2':
				objs = objs.filter(is_offline=False)
			if _get["work_type"] == '1':
				objs = objs.filter(is_offline=True)
			if "region" in _get and _get["region"] != '':
				filters_exists = True
				objs = objs.filter(region__in=_get["region"])
			if "region[]" in _get and _get["region[]"] != '':
				filters_exists = True
				objs = objs.filter(region__in=_get.getlist("region[]")).order_by('id')
		if "work_time_busy" in _get and _get["work_time_busy"] != '3':
			filters_exists = True
			if _get["work_time_busy"] == '2':
				objs = objs.filter(is_fulltime=False)
			if _get["work_time_busy"] == '1':
				objs = objs.filter(is_fulltime=True)
		if "work_deposit" in _get:
			filters_exists = True
			if _get["work_deposit"] == '2':
				objs = objs.filter(deposit=0)
			if _get["work_deposit"] == '1':
				objs = objs.filter(deposit__gt=0)
		if "deposit" in _get and _get["deposit"] != '':
			filters_exists = True
			objs = objs.filter(deposit__lte=_get["deposit"])
		if "work_experience" in _get and _get["work_experience"] != 'NoMatter':
			filters_exists = True
			objs = objs.filter(work_experience=_get["work_experience"])
		if "specialisation[]" in _get and _get["specialisation[]"] != '':
			filters_exists = True
			objs = objs.filter(specialisation_id__in=_get.getlist("specialisation[]"))
		if "specialisation" in _get and _get["specialisation"] != '':
			filters_exists = True
			objs = objs.filter(specialisation_id=int(_get["specialisation"]))


		if not filters_exists:
			obj_count = len(cls.objects.filter(moderated=True, deleted=False, active_search=True,
											   jobpayment__start_at__lte=timezone.now(),
											   jobpayment__expire_at__gte=timezone.now()).order_by(
				'-jobpayment__job_tier_id',
				'-pub_date', '-id').distinct())
			objs = cls.objects.filter(moderated=True, deleted=False, active_search=True, jobpayment__start_at__lte=timezone.now(),
									  jobpayment__expire_at__gte=timezone.now()).order_by('-jobpayment__job_tier_id',
																						  '-pub_date', '-id').distinct()[
				   page*limit:page*limit + limit]
			return obj_count, objs
		else:
			obj_count = len(objs.filter(moderated=True,  deleted=False, active_search=True, jobpayment__start_at__lte=timezone.now(),
							   jobpayment__expire_at__gte=timezone.now()).order_by('-jobpayment__job_tier_id',
																				   '-pub_date', '-id').distinct())
			objs =  objs.filter(moderated=True,  deleted=False, active_search=True, jobpayment__start_at__lte=timezone.now(),
							   jobpayment__expire_at__gte=timezone.now()).order_by('-jobpayment__job_tier_id',
																				   '-pub_date', '-id').distinct()[page*limit:page*limit + limit]
			return obj_count, objs

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


	def get_owner(self):
		return self.company.user





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

	deleted_by_customer = models.BooleanField(default=False)
	deleted_by_worker = models.BooleanField(default=False)
	viewed_by_customer = models.BooleanField(default=False)
	viewed_by_worker = models.BooleanField(default=False)

	deleted = models.BooleanField(default=False)
	deleted_at = models.DateTimeField(auto_now=False, blank=True, null=True, default=None)
 
 
	def delete_by_user(self, user):
		if user.is_customer:
			self.deleted_by_customer = True
		else:
			self.deleted_by_worker = True
		self.status = 3
		self.save()

	def set_deleted(self):
		self.deleted_at = datetime.datetime.now()
		self.deleted = True
		self.save()
		return True

	@classmethod
	def filter_search(cls, user, order="desc", status=1, type=None, page=0, limit=10):
		objs = cls.get_by_user(user)
		order_z = ''
		count = 0
		if order == 'desc':
			order_z = '-'
		if type is not None:
			objs = objs.filter(type=type).order_by(order_z + 'create_date')
			count = len(objs)
		if status is not None:
			objs = objs.filter(status=status).order_by(order_z + 'create_date')
			count = len(objs)
		return objs[page * limit: page*limit + limit], count

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
	def get_resume_invites(cls, resume_id):
		return cls.objects.filter(resume_id=resume_id, type=1)

	@classmethod
	def get_resume_responses(cls, resume_id):
		return cls.objects.filter(resume_id=resume_id, type=0)

	@classmethod
	def get_by_user(cls, user):
		if user.is_worker:
			return cls.objects.filter(resume__user_id=user.id, deleted_by_worker=False)
		else:
			return cls.objects.filter(job__company__user_id=user.id, deleted_by_customer=False)

	@classmethod
	def create_invite(cls, user: User, job_id: int, resume_id: int) :
		try:
			user_job = Job.objects.get(company__user=user, id=job_id)
			invite = ResponseInvite.objects.filter(resume_id=resume_id, job_id=job_id)

			if len(invite):
				# Отклик уже существует
				return invite[0]
			invite = ResponseInvite(resume_id=resume_id, job_id=job_id, type=RESPONSE_INVITE_TYPE["INVITE"],
									status=RESPONSE_INVITE_STATUS["WAIT_FOR_ACCEPT"])
			invite.save()
			return invite
		except Exception as e:
			print(e)
			return False

	@classmethod
	def create_response(cls, user: User, job_id: int, resume_id: int) :
		try:
			user_resume = Resume.objects.get(user=user, id=resume_id)
			invite = ResponseInvite.objects.filter(resume_id=resume_id, job_id=job_id)

			if len(invite):
				# Отклик уже существует
				return invite[0]
			response = ResponseInvite(resume_id=resume_id, job_id=job_id, type=RESPONSE_INVITE_TYPE["RESPONSE"],
									  status=RESPONSE_INVITE_STATUS["WAIT_FOR_ACCEPT"])
			response.save()
			return response
		except Exception as e:
			print(e)
			return False

	@classmethod
	def join_invites(cls, objs, user):
		jobs_ids = []
		for job in objs:
			jobs_ids.append(job.id)
		return cls.objects.filter(job_id__in=jobs_ids, resume__user=user).values()

	@classmethod
	def join_responses(cls, objs, user):
		resume_ids = []
		for resume in objs:
			resume_ids.append(resume.id)
		return cls.objects.filter(resume_id__in=resume_ids, job__company__user=user).values()


class FavoriteJob(models.Model):
	user = models.ForeignKey(to=User, on_delete=models.PROTECT, verbose_name="User")
	job = models.ForeignKey(to=Job, on_delete=models.PROTECT, verbose_name="Job")

	@classmethod
	def get_favorites(cls, user, jobs):
		return cls.objects.filter(user=user, job__in=jobs)

	@classmethod
	def join_favorites(cls, objs, user):
		jobs_ids = []
		for job in objs:
			jobs_ids.append(job.id)
		return cls.objects.filter(job_id__in=jobs_ids, user=user).values()


