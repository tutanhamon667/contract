from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from common.models import Article, ArticleCategory
from users.models.user import Company, Resume, Contact, Job, Member
from users.forms import ResumeForm, ContactForm, CompanyForm, ProfileForm


def resume_view(request, resume_id):
	if request.user.is_authenticated:
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		user = request.user
		print(user)
		error = None
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
				return HttpResponse(status=503)
			else:
				if form.is_valid():
					form.save()
					return redirect(to='profile_resume')
				return render(request, './blocks/profile/profile_resume.html', {
					'form': form,
					'categories': categories,
					'articles': articles
				})
	else:
		return redirect(to="signin")


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

	if request.user.is_authenticated:
		user = request.user
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
	else:
		return redirect(to="signin")


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
				return HttpResponse(status=503)
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
						return HttpResponse(status=503)
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
						return HttpResponse(status=503)
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
	if request.user.is_authenticated:
		user = request.user
		if request.method == "GET":
			member = Member.objects.get(id=user.id)

			company = Company.objects.filter(user_id=user.id)
			if member.is_worker:
				return HttpResponse(status=503)
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
				return HttpResponse(status=503)
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
	else:
		return redirect(to="signin")
