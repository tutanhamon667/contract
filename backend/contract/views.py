from django.shortcuts import render


from django.contrib.auth import get_user_model
from django.http import HttpResponse, HttpResponseNotAllowed
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




import logging
from django.core.exceptions import ObjectDoesNotExist
from django.db import DatabaseError
from django.http import HttpResponseServerError



from django.http import HttpResponse, Http404, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from django.shortcuts import render
from common.models import Article, ArticleCategory

logger = logging.getLogger(__name__)
class ContractView(View):
    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        try:
            return self.handle_view(request, *args, **kwargs)
        except Exception as e:
            logger.exception(f"Unexpected error: {str(e)}")
            return HttpResponseServerError("An unexpected error occurred. Please try again later.")

    def handle_view(self, request, *args, **kwargs):
        raise NotImplementedError
    

class MainView(ContractView):
	def handle_view(self, request, *args, **kwargs):
		try:
			best_customers = CustomerReview.get_top_companies(4)
			banners = Banners.objects.all()
			new_jobs = Job.get_new_jobs(3)
			hot_jobs = Job.get_hot_jobs(3)
			if request.method == 'GET':
				categories_stat = JobSpecialisationStat.objects.all()
			else:
				categories_stat = None	
			return render(request, './pages/main.html', {
				'new_jobs': new_jobs,
				'categories_stat': categories_stat,
				'hot_jobs': hot_jobs,
				'best_customers': best_customers,
				'banners': banners,
			})
		except DatabaseError as e:
			logger.error(f"Database error in main_view: {str(e)}")
			return HttpResponseServerError("A database error occurred. Please try again later.")
		except Exception as e:
			logger.exception(f"Unexpected error in main_view: {str(e)}")
			return HttpResponseServerError("An unexpected error occurred. Please try again later.")



def main_view(request):
    try:
        if request.method in ['GET', 'POST']:
            catalog = Specialisation.objects.all()
            jobs = Job.objects.all()
            best_customers = CustomerReview.get_top_companies(4)
            banners = Banners.objects.all()
            new_jobs = Job.get_new_jobs(3)
            hot_jobs = Job.get_hot_jobs(3)
            articles = Article.objects.all()
            categories = ArticleCategory.objects.all()
            
            if request.method == 'GET':
                categories_stat = JobSpecialisationStat.objects.all()
            else:
                categories_stat = None
            
            return render(request, './pages/main.html', {
                'catalog': catalog,
                'new_jobs': new_jobs,
                'categories_stat': categories_stat,
                'hot_jobs': hot_jobs,
                'best_customers': best_customers,
                'banners': banners,
                'articles': articles,
                'categories': categories
            })
    except DatabaseError as e:
        logger.error(f"Database error in main_view: {str(e)}")
        return HttpResponseServerError("A database error occurred. Please try again later.")
    except Exception as e:
        logger.exception(f"Unexpected error in main_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

class JobsView(ContractView):
    def handle_view(self, request, *args, **kwargs):
        try:
            if request.method != 'GET':
                return HttpResponseNotAllowed(['GET'])

            specialisation = request.GET.get('specialisation')
            search_form = JobFilterForm({'specialisation': specialisation} if specialisation else {})
            context = {
                'search_form': search_form,
            }
            return render(request, './pages/jobs.html', context)
        except Exception as e:
            logger.exception(f"Unexpected error in JobsView: {str(e)}")
            return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def favorite_view(request):
    try:
        if request.method == 'GET':
            articles = Article.objects.all()
            categories = ArticleCategory.objects.all()
            return render(request, './pages/favorite.html', {    
                'articles': articles,
                'categories': categories
            })
    except Exception as e:
        logger.exception(f"Unexpected error in favorite_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def worker_responses_invites_view(request):
    try:
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
                'categories': categories
            })
    except Exception as e:
        logger.exception(f"Unexpected error in worker_responses_invites_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def customer_responses_invites_view(request):
    try:
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
                'categories': categories
            })
    except Exception as e:
        logger.exception(f"Unexpected error in customer_responses_invites_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def job_view(request, job_id):
    try:
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
    except Exception as e:
        logger.exception(f"Unexpected error in job_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def company_view(request, company_id):
    try:
        if request.method == 'GET':
            company = Company.objects.get(id=company_id)
            articles = Article.objects.all()
            categories = ArticleCategory.objects.all()
            review_form = CompanyReviewForm(initial={"company_id": company_id})
            return render(request, './pages/company.html', {
                'company': company,
                "review_form": review_form,
                'articles': articles,
                'categories': categories
            })
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
    except Exception as e:
        logger.exception(f"Unexpected error in company_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def for_customers_view(request):
    try:
        if request.method == 'GET':
            banners = Banners.objects.all()
            customers_count = Member.objects.filter(is_customer=True).count()
            articles = Article.objects.all()
            categories = ArticleCategory.objects.all()
            return render(request, './pages/for_customers.html', {
                'banners': banners,
                'articles': articles,
                'customers_count': customers_count,
                'categories': categories
            })
    except Exception as e:
        logger.exception(f"Unexpected error in for_customers_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def resumes_view(request):
    try:
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
    except Exception as e:
        logger.exception(f"Unexpected error in resumes_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def resume_view(request, resume_id):
    try:
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
                'resume': resume
            })
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
    except Exception as e:
        logger.exception(f"Unexpected error in resume_view: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def not_found_handler(request, exception=None):
	response = HttpResponse()
	
	response = render(request, './404.html', {})
	
	response.set_cookie('my_cookie', 'value', samesite='none', secure=False)
	response.set_headers({'X-Frame-Options': 'chordify.com'})
	return response


def internal_error_handler(request, exception=None):
	return render(request, './404.html', {})