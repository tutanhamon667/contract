import datetime


from django.forms import model_to_dict
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib import messages

from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.settings import CHAT_TYPE
from users.core.access import Access
from users.core.page_builder import PageBuilder
from users.models.user import Company, Resume, Contact, Job, Member, ResponseInvite,CompanyHistory
from users.forms import ResumeForm, ContactForm, CompanyForm, ProfileForm, JobForm, PasswordChangeForm as PasswordChange
from django.contrib.auth import authenticate, update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from users.models.common import  ModerateRequest
from django.forms import modelform_factory
from django.apps import apps
from django.db.models.fields.files import ImageFieldFile
from bitcoinlib.wallets import *

def activate_view(request):
	user = request.user
	access = Access(user)
	code = access.check_access("acivate_account")
	if code != 200:
		if code == 403:
			return redirect('profile_main')
		else:
			return HttpResponse(status=code)
	try:
		chat_with_moderator = Chat.objects.get(customer=user, type=CHAT_TYPE["VERIFICATION"])
	except Exception as e:
		moderator = Member.objects.filter(is_moderator=True)
		chat_with_moderator = Chat(customer=user, moderator=moderator[0], type=CHAT_TYPE["VERIFICATION"])
		chat_with_moderator.save()
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	return render(request, './pages/activate.html', {
				'chat_with_moderator': chat_with_moderator.uuid,
				'categories': categories,
				'articles': articles
			})

def create_tiket(request):
	user = request.user
	access = Access(user)
	code = access.check_access("create_tiket")
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	if request.method == "GET":
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		form = TicketForm( initial={})
		return render(request, './pages/create_tiket.html', {
		
			'form': form,
			'categories': categories,
			'articles': articles
		})
	else:
		form = TicketForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect(to='profile_main')
		else:
			return render(request, './pages/create_tiket.html', {
				'form': form
			})

def profile_resume_create_view(request):
	user = request.user
	access = Access(user)
	code = access.check_access("profile_resume_create")
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	if request.method == "GET":

		form = ResumeForm( initial={})
		return render(request, './blocks/profile/profile_resume_edit.html', {
			'form': form,
			'categories': categories,
			'articles': articles
		})


	if request.method == "POST":
		form =ResumeForm(request.POST, initial=request.POST)
		user_id = user.id
		if user_id != user.id:
			print('fuck off wrong user')
			return HttpResponse(status=403)
		else:
			initial = request.POST
			initial._mutable = True
			initial['region'] = request.POST.getlist('region')
			if form.is_valid():
				edited_form = form.save(commit=False)
				edited_form.user = request.user
				edited_form.save()
				form.save_m2m()
				return redirect(to='profile_resumes')
			return render(request, './blocks/profile/profile_resume_edit.html', {
				'form': form,
				'categories': categories,
				'articles': articles
			})


def profile_resume_delete_view(request, resume_id):
	user = request.user
	access = Access(user)
	code = access.check_access("profile_resume_edit", resume_id)
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	resume = Resume.objects.get(user=user.id, id=resume_id)
	resume.set_deleted()
	messages.success(request, 'Резюме удалено')
	return redirect(to='profile_resumes')

def profile_resume_edit_view(request, resume_id):
	user = request.user
	access = Access(user)
	code = access.check_access("profile_resume_edit", resume_id)
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	if request.method == "GET":
		resume = Resume.objects.get(user=user.id, id=resume_id)
		if resume:
			region_ids = resume.region.values_list('id', flat=True)	
			initial =  model_to_dict(resume)
			initial['region'] = region_ids
			initial['industry'] = resume.specialisation.industry_id
			form = ResumeForm(instance=resume, initial=initial)
			return render(request, './blocks/profile/profile_resume_edit.html', {
				'resume': resume,
				'form': form,
				'categories': categories,
				'articles': articles
			})
		else:
			return HttpResponse(status=404)

	if request.method == "POST":
		resume = Resume.objects.get(user=user.id, id=resume_id)
		form =ResumeForm(request.POST, initial=request.POST)
		user_id = user.id
		if user_id != user.id:
			print('fuck off wrong user')
			return HttpResponse(status=403)
		else:
			initial = request.POST
			initial._mutable = True
			initial['region'] = request.POST.getlist('region')
			if form.is_valid():
				edited_form = form.save(commit=False)
				edited_form.user = request.user
				edited_form.id = resume.id
				edited_form.save()
				form.save_m2m()
				return redirect(to='profile_resumes')
			return render(request, './blocks/profile/profile_resume_edit.html', {
				'form': form,
				'resume': resume,
				'categories': categories,
				'articles': articles
			})


def profile_resume_view(request, resume_id):
	user = request.user
	access = Access(user)
	code = access.check_access("profile_resume")
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	if request.method == "GET":
		resume = Resume.objects.get(user=user.id, id=resume_id)
		if resume:
			return render(request, './blocks/profile/profile_resume.html', {
				'resume': resume,
				'categories': categories,
				'articles': articles
			})
		else:
			return HttpResponse(status=404)



def profile_resumes_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	def resume_page(form, user):
		resumes = Resume.objects.filter(user=user.id)
		if len(resumes) == 0:
			return redirect('profile_resume_create')
		return render(request, './blocks/profile/profile_resumes.html',
					  {'resumes': resumes,
					   'form': form,
					   'categories': categories,
					   'articles': articles
					   })

	user = request.user
	access = Access(user)
	code = access.check_access("profile_resume")
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	if request.method == 'POST':
		try:
			resume_form = ResumeForm(request.POST)
			resume_form.user = request.user
			if resume_form.is_valid():
				resume_form.save()
				resume_form.clean()
				messages.success(request, 'Резюме создано')
			return resume_page(resume_form, user)
		except Exception as e:
			messages.error(request, f'Внутренняя ошибка {e}')
			return HttpResponse(status=500)

	if request.method == "GET":
		form = ResumeForm(initial={'user': user.id})
		resumes = Resume.objects.filter(user=user.id)
		return render(request, './blocks/profile/profile_resumes.html',
					  {'resumes': resumes,
					   'form': form,
					   'categories': categories,
					   'articles': articles
					   })


def contact_view(request, contact_id):
	if request.user.is_authenticated:
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		user = request.user
		print(user)
		error = None

		if request.method == "POST":
			contact = Contact.objects.get(user=user.id, id=contact_id)
			form = ContactForm(request.POST, instance=contact)
			user_id = request.user.id
			if user_id != user.id:
				print('fuck off wrong user')
				return HttpResponse(status=403)
			else:
				if form.is_valid():
					form.save()
					return redirect(to='profile_contacts')
				return render(request, './blocks/profile/profile_contact.html', {
					'form': form
				})
	else:
		return redirect(to="signin")


def contacts_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	def contact_page(form, user):
		contacts = Contact.objects.filter(user=user.id)
		return render(request, './blocks/profile/profile_contacts.html',
					  {'contacts': contacts,
					   'form': form,
					   'categories': categories,
					   'articles': articles
					   })

	if request.user.is_authenticated:
		user = request.user
		if request.method == 'POST':
			id = request.POST.get("id", None)
			if id is not None:
				try:
					if not Contact.is_current_user(id, user):
						print('fuck off wrong user')
						return HttpResponse(status=403)
					else:
						form = ContactForm(request.POST)
						if form.is_valid():
							form.save()
							return redirect(to='profile_contacts')
						return contact_page(form, user)
				except Exception as e:
					print(e)
			else:
				try:
					form = ContactForm(request.POST)
					user_id = int(request.POST.get('user'))
					if user_id != user.id:
						print('fuck off wrong user')
						return HttpResponse(status=403)
					else:
						if form.is_valid():
							form.save()
							return redirect(to='profile_contacts')
						return contact_page(form, user)
				except Exception as e:
					print(e)

		if request.method == "GET":
			form = ContactForm(initial={'user': user.id})
			return contact_page(form, user)
	else:
		return redirect(to="signin")



def profile_favorite_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	if request.user.is_authenticated:
		if request.method == "GET":

			return render(request, './blocks/profile/profile_favorite_jobs.html', {
				'categories': categories,
				'articles': articles
			})
	else:
		return redirect(to="signin")

def profile_main_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	if request.user.is_authenticated:
		user = request.user
		print(user)
		error = None
		if request.method == "GET":
			member = Member.objects.get(id=user.id)
			if member.recovery_code is None:
				recovery_code  = Mnemonic().generate(64)
				member.recovery_code = recovery_code
				member.save()
			profile_form = ProfileForm(instance=member)
			change_pass_form = PasswordChange()
			return render(request, './blocks/profile/profile_main.html', {
				'profile_form': profile_form,
				'change_pass_form': change_pass_form,
				'categories': categories,
				'recovery_code': member.recovery_code,
				'articles': articles
			})

		if request.method == "POST":
			member = Member.objects.get(id=user.id)
			form = ProfileForm(request.POST, request.FILES, instance=member)
			form.id = user.id
			if form.is_valid():
				form.save()
				return redirect(to='profile_main')
			return render(request, './blocks/profile/profile_main.html', {
				'form': form,
				'categories': categories,
				'articles': articles
			})
	else:
		return redirect(to="worker_signin")


def get_changed_data(new_instance, instance):
	changed_data = {}
	model = apps.get_model('users', 'company')
	for field in model._meta.fields:
		original_value = getattr(instance, field.name)
		form_value = getattr(new_instance, field.name)
	 # check if the field has type ImageFieldFile
		if type(getattr(instance, field.name)) is ImageFieldFile:
			original_value = getattr(instance, field.name)
			form_value = getattr(new_instance, field.name)
			original_value_url=None
			form_value_url=None
			if original_value._file is not None:
				original_value_url =form_value.field.upload_to +  form_value.name
			if form_value._file is not None:
				form_value_url = form_value.field.upload_to +  form_value.name
			if original_value_url != form_value_url:
				changed_data[field.name] = {"value":form_value_url, "type":"image", 'title': field.verbose_name}
		else:	   
			if original_value != form_value:
				changed_data[field.name] =  {"value":form_value, "type":"text", 'title': field.verbose_name} 
	return changed_data

def profile_company_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	user = request.user
	access = Access(user)
	code = access.check_access("profile_company")
	if code != 200:
		if code == 666:
			return redirect('activate_view')
		if code == 401:
			return redirect('customer_signin')
		else:
			return HttpResponse(status=code)
	if request.method == "GET":
		member = Member.objects.get(id=user.id)

		company = Company.objects.filter(user_id=user.id)
		if member.is_worker:
			return HttpResponse(status=403)
		form = None
		if len(company) > 0:
			company = company[0]
		else:
			company = Company(user=user)
		form = CompanyForm(instance=company)
		contacts = Contact.get_company_links(user)
		return render(request, './blocks/profile/profile_company.html', {
			'form': form,
			'contacts': contacts,
			'company': company,
			'categories': categories,
			'articles': articles
		})

	if request.method == "POST":
		member = Member.objects.get(id=user.id)
		if member.is_worker:
			return HttpResponse(status=403)
		company = Company.objects.filter(user_id=user.id)
		company = company[0]
		form = None
		if len(request.FILES) > 0:
			form = CompanyForm( request.POST, request.FILES, instance=company)
		else:
			form = CompanyForm( request.POST, instance=company)
		if form.is_valid():
			original_company = Company.objects.get(user_id=user.id)
			comp = form.save(commit=False)
			changes = get_changed_data(comp, original_company)
			if 'name' in changes or  len(request.FILES):
				review_request = ModerateRequest.create_request(Company,original_company.id, changes=changes, comment='Редактирование компании')
				chat = Chat.get_user_system_chat(request.user)
				chat.create_system_message(f' Создана заявка на редактирование компании: #{review_request.id}. Ждите проверки модератора')
				messages.success(request, 'Информация о компании будет обновлена после проверки модератором')
			
			comp.name = original_company.name
			comp.logo = original_company.logo
			comp.save()
			links = request.POST.getlist('link[]')
			Contact.update_company_contacts(user, links)
			messages.success(request, 'Информация о компании была успешно обновлена')
			return redirect(to='profile_company_view')
		return render(request, './blocks/profile/profile_company.html', {
			'form': form,
			'company': company,
			'categories': categories,
			'articles': articles
		})




def jobs_profile_view(request):
	user = request.user
	access = Access(user)
	code = access.check_access("profile_job")
	if code != 200:
		if code == 666:
			return redirect('activate_view')
		if code == 401:
			return redirect('customer_signin')
		else:
			return HttpResponse(status=code)
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	page = "PROFILE_JOBS"
	builder = PageBuilder(page)
	params = builder.build_get_params(request.GET)
	if builder.route_with_params(request.GET):
		return redirect(f'{request.path}?{params}')

	if request.method == "GET":
		company = Company.objects.get(user_id=user.id)
		jobs = Job.objects.filter(company=company.id, deleted=False)
		now = datetime.now()
		jobs_paid = jobs.filter(jobpayment__start_at__lte=now, jobpayment__expire_at__gte=now)
		jobs_not_paid_ids = []
		for job_paid in jobs_paid:
			jobs_not_paid_ids.append(job_paid.id)
		jobs_not_paid = jobs.filter().exclude(id__in=jobs_not_paid_ids)
		return render(request, './blocks/profile/profile_jobs.html',
					  {'jobs': jobs,
					   'jobs_not_paid': jobs_not_paid,
					   'jobs_paid': jobs_paid,
					   'categories': categories,
					   'articles': articles
					   })
	else:
		return HttpResponse(status=404)

def profile_response_invite_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	user = request.user
	access = Access(user)
	code = access.check_access("profile_invite_response")
	if code != 200:
		if code == 401:
			return redirect('signin')
		if code == 666:
			return redirect('activate_view')
		else:
			return HttpResponse(status=code)

	page = "PROFILE_RESPONSE_INVITE"
	builder = PageBuilder(page)
	params = builder.build_get_params(request.GET)
	if builder.route_with_params(request.GET):
		return redirect(f'{request.path}?{params}')
	if request.method == "GET":
		invite_response = ResponseInvite.get_by_user(user)
		invite_response = ResponseInvite.filter_search(invite_response, request.GET["order"], request.GET["status"],
													   request.GET["type"], int(request.GET["page"]))

		return render(request, './blocks/profile/profile_response_invite.html',
					  {
						  'invite_response': invite_response,
						  'categories': categories,
						  'articles': articles
					  })

def copy_errors(source_form, target_form):
	for field, errors in source_form.errors.items():
		for error in errors:
			target_form.add_error(field, error)

def change_password(request):
	if request.user.is_authenticated:
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		if request.method == 'POST':
			form = PasswordChangeForm(request.user, request.POST)
			if form.is_valid():
				user = form.save()
				update_session_auth_hash(request, user) 
				messages.success(request, 'Пароль был успешно изменён')
			else:
				articles = Article.objects.all()
				categories = ArticleCategory.objects.all()
				member = Member.objects.get(id=request.user.id)
				profile_form = ProfileForm(instance=member)
				
				change_pass_form = PasswordChange({})
				change_pass_form.is_valid()
				change_pass_form.errors.clear()
				copy_errors(form, change_pass_form)
				return render(request, './blocks/profile/profile_main.html', {
					'profile_form': profile_form,
					'change_pass_form': change_pass_form,
					'categories': categories,
					'articles': articles
				})

			return redirect('profile_main')
	else:
		redirect('worker_signin')