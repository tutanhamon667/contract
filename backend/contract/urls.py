from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from btc.views import gen_address, profile_wallet_view
from users.controllers.job import jobs_view, job_view
from users.controllers.profile import resumes_view, resume_view, contact_view, contacts_view, profile_main_view
from users.controllers.auth import registration_worker_view, registration_customer_view, login_view, logout_view
from . import settings
from users.views import captcha_view, profile_view,   \
    register_view
from orders.views import main_view

schema_view = get_schema_view(
    openapi.Info(
        title="Freelance platform API",
        default_version='v1',
        description="Freelance platform API",
        # terms_of_service="https://www.yourapp.com/terms/",
        # contact=openapi.Contact(email="contact@yourapp.com"),
        # license=openapi.License(name="Your License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('', main_view, name='index'),
    path('captcha', captcha_view, name='captcha'),
    path('signin', login_view, name='signin'),
    path('signup/worker', registration_worker_view, name='register'),
    path('signup/customer', registration_customer_view, name='register'),
    path('logout', logout_view, name='logout'),
    path('profile', profile_main_view, name='profile_main'),
    path('profile/resume', resumes_view, name='profile_resume'),
    path('profile/resume/<int:resume_id>', resume_view, name='profile_resume'),
    path('profile/contact', contacts_view, name='profile_contacts'),
    path('profile/contact/<int:contact_id>', contact_view, name='profile_contacts'),
    path('profile/job', jobs_view, name='profile_jobs'),
    path('profile/job/<int:job_id>', job_view, name='profile_job'),
    path('profile/wallet', profile_wallet_view, name='profile_wallet'),


    #path('btc/generate_address', gen_address, name='generate_address'),




    path('admin/', admin.site.urls),
    path('swagger/',
         schema_view.with_ui('swagger', cache_timeout=0),
         name='schema-swagger-ui'),
    path('redoc/',
         schema_view.with_ui('redoc', cache_timeout=0),
         name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
