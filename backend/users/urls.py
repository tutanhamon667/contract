from django.urls import path

from .controllers.api import *


urlpatterns = [
    path("favorite", favorite_job, name="favorite"),
    path("jobs", get_jobs, name="jobs"),
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