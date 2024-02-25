from django.contrib import messages

from django.contrib.auth import get_user_model
from captcha.image import ImageCaptcha
from django.shortcuts import render, redirect
from django.template.defaulttags import register
from pytz import unicode

from common.models import Article, ArticleCategory
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from orders.models import JobSpecialisationStat
from users.forms import JobFilterForm, CompanyReviewForm
from users.models.common import Captcha
from users.models.user import Member, Company, CustomerReview, Specialisation, Job, Contact
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
		search_form = JobFilterForm(initial=request.GET)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		jobs = Job.search_filter(request, 10)
		return render(request, './pages/jobs.html', {
			'search_form': search_form,
			'jobs': jobs,
			'articles': articles,
			'categories': categories})

def job_view(request, job_id):
	if request.method == 'GET':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		job = Job.objects.get(id=job_id)
		company = Company.objects.get(id=job.company_id)
		rating = CustomerReview.get_company_rating(company.id)
		reviews = CustomerReview.objects.filter(company_id=company.id)
		contacts = Contact.objects.filter(user=company.user_id)
		return render(request, './pages/job.html', {
			'job': job,
			'articles': articles,
			'categories': categories,
			'rating': rating,
			'reviews_count': len(reviews),
		'company': company,
		'contacts': contacts})


def company_view(request, company_id):
	if request.method == 'GET':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		jobs = Job.objects.filter(company_id=company_id)
		company = Company.objects.get(id=company_id)
		rating = CustomerReview.get_company_rating(company.id)
		reviews = CustomerReview.objects.filter(company_id=company.id)
		contacts = Contact.objects.filter(user=company.user_id)
		form = CompanyReviewForm( initial={"company": company})
		captcha = Captcha()
		key, hash_key = captcha.generate_key()
		image = SimpleCaptcha(width=280, height=90)
		captcha_base64 = image.get_base64(key)
		return render(request, './pages/company.html', {
			'jobs': jobs,
			'form': form,
			'articles': articles,
			'categories': categories,
			'rating': rating,
			'reviews_count': len(reviews),
			'reviews':reviews,
		'company': company,
		'contacts': contacts, 'hashkey': hash_key, 'captcha': captcha_base64})
	if request.method == "POST":
		form = CompanyReviewForm(request.POST)

		hash_key = request.POST.get("hashkey")
		res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
		if not res:
			articles = Article.objects.all()
			categories = ArticleCategory.objects.all()
			jobs = Job.objects.filter(company_id=company_id)
			company = Company.objects.get(id=company_id)
			rating = CustomerReview.get_company_rating(company.id)
			reviews = CustomerReview.objects.filter(company_id=company.id)
			contacts = Contact.objects.filter(user=company.user_id)
			messages.error(request, "Unsuccessful review. Captcha Invalid .")
			return render(request, './pages/company.html', {
				'jobs': jobs,
				'form': form,
				'articles': articles,
				'categories': categories,
				'rating': rating,
				'reviews_count': len(reviews),
				'reviews': reviews,
				'company': company,
				'contacts': contacts,
				'hashkey': hash_key,
                'captcha': SimpleCaptcha.captcha_check(request)})
		else:
			if request.user.is_authenticated:

				user = request.user
				form.reviewer = user
				form.moderated = False
				if form.is_valid():
					messages.success(request, "Ваш отзыв отправлен на модерацию")
					form.save()
					form.clean()

				articles = Article.objects.all()
				categories = ArticleCategory.objects.all()
				jobs = Job.objects.filter(company_id=company_id)
				company = Company.objects.get(id=company_id)
				rating = CustomerReview.get_company_rating(company.id)
				reviews = CustomerReview.objects.filter(company_id=company.id)
				contacts = Contact.objects.filter(user=company.user_id)

				return render(request, './pages/company.html', {
					'jobs': jobs,
					'form': form,
					'articles': articles,
					'categories': categories,
					'rating': rating,
					'reviews_count': len(reviews),
					'reviews': reviews,
					'company': company,
					'contacts': contacts,
					'hashkey': hash_key,
					'captcha': SimpleCaptcha.captcha_check(request)})
			else:
				return redirect("signin")


def for_customers_view(request):
	if request.method == 'GET':
		banners = Banners.objects.all()
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		return render(request, './pages/for_customers.html', {
			'banners': banners,
			'articles': articles,
			'categories': categories})
