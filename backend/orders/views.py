from django.contrib.auth import get_user_model
from captcha.image import ImageCaptcha
from django.shortcuts import render

from orders.models import  JobSpecialisationStat
from users.models.user import CustomerProfile,  CustomerReview,Specialisation, Job
from users.models.advertise import Banners

User = get_user_model()


def main_view(request):
    if request.method == 'GET':

        catalog = Specialisation.objects.all()
        jobs = Job.objects.all()
        categories_stat = JobSpecialisationStat.objects.all()
        best_customers = CustomerReview.get_top_customers(4)
        banners = Banners.objects.all()
        new_jobs = Job.get_new_jobs(3)
        hot_jobs = Job.get_hot_jobs(3)
        return render(request, './pages/main.html', {
                                                'catalog': catalog,
                                                'new_jobs': new_jobs,
                                                'categories_stat': categories_stat,
                                                'hot_jobs': hot_jobs,
                                                'best_customers': best_customers,
                                                'banners': banners})

    if request.method == "POST":
        catalog = Specialisation.objects.all()
        jobs = Job.objects.all()
        # categories_stat = JobSpecialisationStat.objects.all()
        best_customers = CustomerReview.get_top_customers(4)
        banners = Banners.objects.all()
        new_jobs = Job.get_new_jobs(4)
        hot_jobs = Job.get_hot_jobs(4)
        return render(request, './pages/main.html', {
            'catalog': catalog,
            'new_jobs': new_jobs,
            # 'categories_stat': categories_stat,
            'hot_jobs': hot_jobs,
            'best_customers': best_customers,
            'banners': banners})