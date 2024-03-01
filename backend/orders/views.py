from django.contrib import messages

from django.contrib.auth import get_user_model
from captcha.image import ImageCaptcha
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template.defaulttags import register

from common.models import Article, ArticleCategory
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import RESPONSE_INVITE_TYPE, RESPONSE_INVITE_STATUS
from orders.models import JobSpecialisationStat
from users.core.access import Access
from users.forms import JobFilterForm, CompanyReviewForm, ResponseForm, InviteForm, ResumeFilterForm
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
		search_form = JobFilterForm(initial=request.GET)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		jobs = Job.search_filter(request, 10)
		job_ids = []
		for job in jobs:
			job_ids.append(job.id)
		form_response = None
		resumes = None
		job_responses = []
		if request.user.is_authenticated:
			user = request.user
			job_responses = ResponseInvite.objects.filter(job_id__in=job_ids).values()
			for job in jobs:
				for job_response in job_responses:
					if job.id == job_response["job_id"]:
						job.status = job_response["status"]
			resumes = Resume.objects.filter(user=user)

			form_response = ResponseForm(
				initial={"user": user, "type": RESPONSE_INVITE_TYPE["RESPONSE"], "resume": resumes})
		return render(request, './pages/jobs.html', {
			'search_form': search_form,
			'jobs': jobs,
			'articles': articles,
			'job_responses': job_responses,
			'form_response': form_response,
			'categories': categories,
			'resumes': resumes})

	if request.method == 'POST':
		search_form = JobFilterForm(initial=request.GET)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		jobs = Job.search_filter(request, 10)
		form_response = None
		resumes = None
		if request.user.is_authenticated:
			user = request.user
			resumes = Resume.objects.filter(user=user)
			form_response = ResponseForm(request.POST, initial={"resume": resumes})
			job_id = request.POST["job"]
			resume_id = request.POST["resume"]
			res = ResponseInvite.create_response(user, job_id, resume_id)
			if not res:
				return HttpResponse(500)
			messages.success(request, 'Отклик отправлен')
		return render(request, './pages/jobs.html', {
			'search_form': search_form,
			'jobs': jobs,
			'articles': articles,
			'form_response': form_response,
			'categories': categories,
			'resumes': resumes})


def job_view(request, job_id):
	if request.method == 'GET':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		job = Job.objects.get(id=job_id)
		job.increase_views()
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
		reviews = CustomerReview.get_company_reviews(company_id=company.id)
		contacts = Contact.objects.filter(user=company.user_id)
		form = CompanyReviewForm(initial={"company": company, "reviewer": request.user})
		resumes = []
		if request.user.is_authenticated:
			resumes = Resume.objects.filter(user=request.user)
		captcha = Captcha()
		key, hash_key = captcha.generate_key()
		image = SimpleCaptcha(width=280, height=90)
		captcha_base64 = image.get_base64(key)
		return render(request, './pages/company.html', {
			'jobs': jobs,
			'form': form,
			'articles': articles,
			'resumes': resumes,
			'categories': categories,
			'rating': rating,
			'reviews_count': len(reviews),
			'reviews': reviews,
			'company': company,
			'contacts': contacts, 'hashkey': hash_key, 'captcha': captcha_base64})
	if request.method == "POST":
		if request.user.is_authenticated == False:
			return redirect('signin')
		if request.user.is_customer:
			return HttpResponse(status=403)
		review = CustomerReview(reviewer=request.user, moderated=False)
		form = CompanyReviewForm(request.POST, initial={"moderated": False, "reviewer": request.user})
		hash_key = request.POST.get("hashkey")
		res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
		if not res:
			articles = Article.objects.all()
			categories = ArticleCategory.objects.all()
			jobs = Job.objects.filter(company_id=company_id)
			company = Company.objects.get(id=company_id)
			rating = CustomerReview.get_company_rating(company.id)
			reviews = CustomerReview.get_company_reviews(company_id=company.id)
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
				edited_form = form.save(commit=False)
				edited_form.reviewer = request.user
				edited_form.moderated = False
				edited_form.save()
				if form.is_valid():
					messages.success(request, "Ваш отзыв отправлен на модерацию")
					form.clean()

				articles = Article.objects.all()
				categories = ArticleCategory.objects.all()
				jobs = Job.objects.filter(company_id=company_id)
				company = Company.objects.get(id=company_id)
				rating = CustomerReview.get_company_rating(company.id)
				reviews = CustomerReview.get_company_reviews(company_id=company.id)
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


def resumes_view(request):
	user = request.user
	access = Access(user)
	code = access.check_access("resume")
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)

	if request.method == 'GET':
		search_form = ResumeFilterForm(initial=request.GET)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		resumes = Resume.search_filter(request, 10)
		resumes = Resume.join_invites(resumes)
		company = Company.objects.get(user=user)
		jobs = Job.objects.filter(company=company)

		form_response = InviteForm(
			initial={"type": RESPONSE_INVITE_TYPE["RESPONSE"], "user": user})
		return render(request, './pages/resumes.html', {
			'search_form': search_form,
			'jobs': jobs,
			'articles': articles,
			'form_response': form_response,
			'categories': categories,
			'resumes': resumes})

	if request.method == 'POST':
		search_form = ResumeFilterForm(initial=request.GET)
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		jobs = Resume.search_filter(request, 10)
		form_response = InviteForm(request.POST,
			initial={"type": RESPONSE_INVITE_TYPE["RESPONSE"], "user": user})
		job_id = request.POST["job"]
		resume_id = request.POST["resume"]
		res = ResponseInvite.create_invite(user, job_id, resume_id)
		if not res:
			return HttpResponse(500)
		resumes = Resume.search_filter(request, 10)
		resumes = Resume.join_invites(resumes)
		messages.success(request, 'Отклик отправлен')
		return render(request, './pages/resumes.html', {
			'search_form': search_form,
			'articles': articles,
			'jobs': jobs,
			'form_response': form_response,
			'categories': categories,
			'resumes': resumes})




def resume_view(request, resume_id):
	user = request.user
	access = Access(user)
	code = access.check_access("resume", resume_id)
	if code != 200:
		if code == 401:
			return redirect('signin')
		else:
			return HttpResponse(status=code)

	if request.method == 'GET':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		resume = Resume.objects.get(id=resume_id)
		resume.increase_views()
		worker = Member.objects.get(id=resume.user.id)
		resumes = Resume.join_invites([resume])
		company = Company.objects.get(user=user)
		jobs = Job.objects.filter(company=company)
		form_response = InviteForm(
			initial={"type": RESPONSE_INVITE_TYPE["INVITE"], "user": user})
		return render(request, './pages/resume.html', {
			'articles': articles,
			'jobs': jobs,
			'worker': worker,
			'categories': categories,
			'form_response': form_response,
			'resume': resumes[0]})
	if request.method == 'POST':
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		form_response = InviteForm(request.POST,
								   initial={"type": RESPONSE_INVITE_TYPE["INVITE"], "user": user})
		job_id = request.POST["job"]
		resume_id = request.POST["resume"]
		res = ResponseInvite.create_invite(user, job_id, resume_id)
		if not res:
			return HttpResponse(500)
		resume = Resume.objects.get(id=resume_id)
		worker = Member.objects.get(id=resume.user.id)
		resumes = Resume.join_invites([resume])
		company = Company.objects.get(user=user)
		jobs = Job.objects.filter(company=company)
		return render(request, './pages/resume.html', {
			'articles': articles,
			'jobs': jobs,
			'worker': worker,
			'categories': categories,
			'form_response': form_response,
			'resume': resumes[0]})
