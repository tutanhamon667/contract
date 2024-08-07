from django.shortcuts import render


from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import render, redirect

from common.models import Article, ArticleCategory
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import RESPONSE_INVITE_TYPE, RESPONSE_INVITE_STATUS
from users.models.user import JobSpecialisationStat
from users.core.access import Access
from users.forms import JobFilterForm, CompanyReviewForm, InviteForm, ResumeFilterForm, WorkerReviewForm
from users.models.common import Captcha
from users.models.user import Member, Company, CustomerReview, Specialisation, Job, Contact, Resume, ResponseInvite
from users.models.advertise import Banners



User = get_user_model()


def main_view(request):
	if request.method == 'GET':
		catalog = Specialisation.objects.all()
		jobs = Job.objects.all()
		categories_stat = JobSpecialisationStat.objects.all()
		best_customers = CustomerReview.get_top_companies(4)
		banners = Banners.objects.all()
		new_jobs = Job.get_new_jobs(3)
		hot_jobs = Job.get_hot_jobs(3)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/main.html', {
			'catalog': catalog,
			'new_jobs': new_jobs,
			'categories_stat': categories_stat,
			'hot_jobs': hot_jobs,
			'best_customers': best_customers,
			'banners': banners,
			'articles': articles,
			'categories': categories})

	if request.method == "POST":
		catalog = Specialisation.objects.all()
		jobs = Job.objects.all()
		# categories_stat = JobSpecialisationStat.objects.all()
		best_customers = CustomerReview.get_top_companies(4)
		banners = Banners.objects.all()
		new_jobs = Job.get_new_jobs(4)
		hot_jobs = Job.get_hot_jobs(4)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/main.html', {
			'catalog': catalog,
			'new_jobs': new_jobs,
			# 'categories_stat': categories_stat,
			'hot_jobs': hot_jobs,
			'best_customers': best_customers,
			'banners': banners,
			'articles': articles,
			'categories': categories})


def jobs_view(request):
	if request.method == 'GET':
		initial = {}
		if 'specialisation' in request.GET:
			initial['specialisation'] = request.GET['specialisation']
		search_form = JobFilterForm(initial=initial)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/jobs.html', {
			'search_form': search_form,
			'articles': articles,
			'categories': categories
			})


def favorite_view(request):
	if request.method == 'GET':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/favorite.html', {	
			'articles': articles,
			'categories': categories})

def worker_responses_invites_view(request):
	if request.method == 'GET':
		user = request.user
		access = Access(user)
		code = access.check_access("worker_responses_invites_view")
		if code != 200:
			if code == 401:
				return redirect('worker_signin')
			else:
				return HttpResponse(status=code)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/worker_ri.html', {
			'articles': articles,
			'categories': categories	})

def customer_responses_invites_view(request):
	if request.method == 'GET':
		user = request.user
		access = Access(user)
		code = access.check_access("customer_responses_invites_view")
		if code != 200:
			if code == 401:
				return redirect('customer_signin')
			else:
				return HttpResponse(status=code)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/customer_ri.html', {
			'articles': articles,
			'categories': categories})


def job_view(request, job_id):
	if request.method == 'GET':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		try:
			job = Job.objects.get(id=job_id)
			job.increase_views()
		except Job.DoesNotExist:
			return HttpResponse(status=404)
		return render(request, './pages/job.html', {
			'job': job,
			'articles': articles,
			'categories': categories
		})


def company_view(request, company_id):
	if request.method == 'GET':
		company = Company.objects.get(id=company_id)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		review_form = CompanyReviewForm(initial={"company_id": company_id})
		return render(request, './pages/company.html', {'company': company,"review_form":review_form,
			'articles': articles,
			'categories': categories})



def for_customers_view(request):
	if request.method == 'GET':
		banners = Banners.objects.all()
		customers_count = Member.objects.filter(is_customer=True).count()
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/for_customers.html', {
			'banners': banners,
			'articles': articles,
			'customers_count': customers_count,
			'categories': categories})


def resumes_view(request):
	user = request.user
	access = Access(user)
	code = access.check_access("resume")
	if code != 200:
		if code == 401:
			return redirect('customer_signin')
		if code == 503:
			articles = Article.objects.all()
			categories = ArticleCategory.objects.all()
			return render(request, './pages/customer_access_resumes.html', {
				'articles': articles,
				'categories': categories,
				})
		else:
			return HttpResponse(status=code)

	if request.method == 'GET':
		search_form = ResumeFilterForm(initial=request.GET)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		form_response = InviteForm(
			initial={"type": RESPONSE_INVITE_TYPE["RESPONSE"], "user": user})
		return render(request, './pages/resumes.html', {
			'search_form': search_form,
			'form_response': form_response,
			'articles': articles,
			'categories': categories
})



def resume_view(request, resume_id):
	user = request.user
	access = Access(user)
	code = access.check_access("resume", resume_id)
	if code != 200:
		if code == 503:
			articles = Article.objects.all()
			categories = ArticleCategory.objects.all()
			return render(request, './pages/customer_access_resumes.html', {
				'articles': articles,
				'categories': categories,
				})
		if code == 401:
			return redirect('customer_signin')
		else:
			return HttpResponse(status=code)

	if request.method == 'GET':

		resume = Resume.objects.get(id=resume_id)
		resume.increase_views()
		review_form = WorkerReviewForm(initial={"resume_id": resume.id})
		form_response = InviteForm(
      
			initial={"type": RESPONSE_INVITE_TYPE["INVITE"], "user": user})
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/resume.html', {
      		'resume_serialized': {'id':resume.id},
			'review_form': review_form,
			'form_response': form_response,
			'articles': articles,
			'categories': categories,
			'resume': resume})

def not_found_handler(request, exception=None):
	return render(request, './404.html', {})


def internal_error_handler(request, exception=None):
	return render(request, './404.html', {})