from django.http import HttpResponse
from django.shortcuts import render, redirect

from common.models import Article, ArticleCategory
from users.models.user import Company, Member, Resume, Contact, Job
from users.forms import JobForm


def job_profile_view(request, job_id):
	if request.user.is_authenticated:

		user = request.user
		res = Member.has_customer_permission(user.id)
		_t = type(res).__name__
		if _t != 'QuerySet':
			return res
		member = res
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		if request.method == "GET":
			company = Company.objects.get(user_id=user.id)
			job = Job.objects.get(company=company.id, id=job_id)
			if job:
				form = JobForm(instance=job)
				return render(request, './blocks/profile/profile_job.html', {
					'form': form,
					'categories': categories,
					'articles': articles
				})
			else:
				return HttpResponse(status=404)

		if request.method == "POST":
			company = Company.objects.get(user_id=user.id)
			job = Job.objects.get(company=company.id, id=job_id)
			form = JobForm(request.POST, instance=job)
			form.company_id = company.id
			if form.is_valid():
				form.save()
				return redirect(to='profile_jobs')
			return render(request, './blocks/profile/profile_job.html', {
				'form': form,
				'categories': categories,
				'articles': articles
			})
	else:
		return redirect(to="login")


def jobs_profile_view(request):

	def get_page(form, company):
		if request.user.is_authenticated:
			jobs = Job.objects.filter(company=company.id)
			return render(request, './blocks/profile/profile_jobs.html',
						  {'jobs': jobs,
						   'form': form,
						   'categories': categories,
						   'articles': articles
						   })
		else:
			return redirect(to="login")

	if request.user.is_authenticated:
		user = request.user
		res = Member.has_customer_permission(user.id)
		_t = type(res).__name__
		if _t != 'QuerySet':
			return res
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		if request.method == 'POST':

			form = JobForm(request.POST,)
			company = Company.objects.get(user_id=user.id)
			form.company_id = company.id
			if form.is_valid():
				form.save()
				return redirect(to='profile_jobs')
			else:
				return get_page(form, company)

		if request.method == "GET":
			company = Company.objects.get(user_id=user.id)
			new_entity_form = JobForm(initial={'company': company.id})
			return get_page(new_entity_form, company)

	else:
		return redirect(to="signin")
