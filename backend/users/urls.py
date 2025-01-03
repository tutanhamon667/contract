from django.urls import path

from .controllers.api import *
from .controllers.profile import *

urlpatterns = [
	path("profile_signup_worker", signup_worker, name="profile_signup_worker"),
    path("profile_signup_customer", signup_customer, name="profile_signup_customer"),
	path("favorite", favorite_job, name="favorite"),
	path("jobs", get_jobs, name="jobs"),
	path("job", get_job, name="job"),
	path("resume", get_resume, name="resume"),
	path("company", get_company, name="company"),
	path("favorite_jobs", favorite_jobs, name="favorite_jobs"),
	path("company_reviews", company_reviews, name="company_reviews"),
	path("respones_invites", get_responses_invites, name="responses_invites"),
	path("get_counters", get_counters, name="get_counters"),
	path("calc_tier_payment", calc_tier_payment, name="calc_ter_payment"),
	path("access_payment", access_payment, name="access_payment"),
	path('contacts', get_contacts, name='my_contacts'),
	path("profile_jobs", get_profile_jobs, name="api_profile_jobs"),
	path("worker_reviews", worker_reviews, name="worker_reviews"),
	path("create_review", create_review, name="create_review"),
	path("create_worker_review", create_worker_review, name="create_worker_review"),
	path("get_user_transactions", get_user_transactions, name="get_user_transactions"),
	path("leave_chat", leave_chat, name="leave_chat"),
	path("resume_statistics", get_resume_statistics, name="resume_statistics"),
	path("filter_resumes", filter_resumes, name="filter_resumes"),
	path("response_invite", response_invite, name="response_invite"),
	path("user_resumes", get_user_resumes, name="user_resumes"),
	path("balance", get_balance, name="balance"),
	path("menu", get_menu, name="menu"),
	path("user", get_user, name="user"),
	path("hot_jobs", get_hot_jobs, name="hot_jobs"),
	path("categories_jobs", get_categories_jobs, name="categories_jobs"),
	path("best_customers", get_best_customers, name="best_customers"),
	path("banners", get_banners, name="banners"),
	path("new_jobs", get_new_jobs, name="new_jobs"),
	path("user", get_user, name="user"),
	path("balance", get_balance, name="balance"),
]
 