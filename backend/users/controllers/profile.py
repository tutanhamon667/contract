import datetime

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib import messages

from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.settings import CHAT_TYPE
from users.core.access import Access
from users.core.page_builder import PageBuilder
from users.models.user import Company, Resume, Contact, Job, Member, ResponseInvite
from users.forms import ResumeForm, ContactForm, CompanyForm, ProfileForm, JobForm


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
			form = ResumeForm(instance=resume)
			return render(request, './blocks/profile/profile_resume.html', {
				'form': form,
				'categories': categories,
				'articles': articles
			})
		else:
			return HttpResponse(status=404)

	if request.method == "POST":
		resume = Resume.objects.get(user=user.id, id=resume_id)
		form = ResumeForm(request.POST, instance=resume)
		user_id = int(request.POST.get('user'))
		if user_id != user.id:
			print('fuck off wrong user')
			return HttpResponse(status=403)
		else:
			if form.is_valid():
				form.save()
				return redirect(to='profile_resume')
			return render(request, './blocks/profile/profile_resume.html', {
				'form': form,
				'categories': categories,
				'articles': articles
			})


def profile_resumes_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()

	def resume_page(form, user):
		resumes = Resume.objects.filter(user=user.id)
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
		if request.method == "GET":
			contact = Contact.objects.get(user=user.id, id=contact_id)
			if contact:
				form = ContactForm(instance=contact)
				return render(request, './blocks/profile/profile_contact.html', {
					'form': form,
					'categories': categories,
					'articles': articles
				})
			else:
				return HttpResponse(status=404)

		if request.method == "POST":
			contact = Contact.objects.get(user=user.id, id=contact_id)
			form = ContactForm(request.POST, instance=contact)
			user_id = int(request.POST.get('user'))
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


def profile_main_view(request):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	if request.user.is_authenticated:
		user = request.user
		print(user)
		error = None
		if request.method == "GET":
			member = Member.objects.get(id=user.id)
			form = ProfileForm(instance=member)
			return render(request, './blocks/profile/profile_main.html', {
				'form': form,
				'categories': categories,
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
		return redirect(to="signin")


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
			return redirect('signin')
		else:
			return HttpResponse(status=code)
	if request.method == "GET":
		member = Member.objects.get(id=user.id)

		company = Company.objects.filter(user_id=user.id)
		if member.is_worker:
			return HttpResponse(status=403)
		form = None
		if len(company) > 0:
			form = CompanyForm(instance=company[0])
		else:
			form = CompanyForm(initial={'user': user.id})
		return render(request, './blocks/profile/profile_company.html', {
			'form': form,
			'company': company,
			'categories': categories,
			'articles': articles
		})

	if request.method == "POST":
		member = Member.objects.get(id=user.id)
		if member.is_worker:
			return HttpResponse(status=403)
		company = Company.objects.filter(user_id=user.id)
		form = None
		if len(company) > 0:
			form = CompanyForm(request.POST, request.FILES, instance=company[0])
		else:
			form = CompanyForm(request.POST, request.FILES)
		form.user_id = user.id
		if form.is_valid():
			form.save()
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
			return redirect('signin')
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
		jobs = Job.objects.filter(company=company.id)
		now = datetime.datetime.now()
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
