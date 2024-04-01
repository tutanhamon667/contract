from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from btc.views import profile_wallet_view, update_addresses, get_btc_usd, customer_access
from common.views import article_view
from users.controllers.comment import comment_view
from users.controllers.job import profile_job_view
from users.controllers.response_invite import response_invite_view

from users.controllers.profile import profile_resumes_view, profile_resume_view, contact_view, contacts_view, \
    profile_main_view, \
    profile_company_view, jobs_profile_view, profile_response_invite_view, activate_view, profile_favorite_view
from users.controllers.auth import registration_worker_view, registration_customer_view, login_view, logout_view
from users.controllers.test_view import test
from . import settings
from users.views import captcha_view
from orders.views import main_view, for_customers_view, jobs_view, job_view, company_view, resumes_view, resume_view

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
CKEDITOR_5_FILE_STORAGE = "/media"  # optional
urlpatterns = [
    path('ckeditor5/', include('django_ckeditor_5.urls')),
    path('', main_view, name='index'),
    path('for_customers', for_customers_view, name='for_customers'),
    path('captcha', captcha_view, name='captcha'),
    path('signin', login_view, name='signin'),
    path('signup/worker', registration_worker_view, name='register'),
    path('signup/customer', registration_customer_view, name='register'),
    path('logout', logout_view, name='logout'),
    path('jobs', jobs_view, name='jobs'),
    path('resumes', resumes_view, name='resumes'),
    path('test_view', test, name='test_view'),
    path('comment/create', comment_view.create, name='comment_create'),
    path('response_invite/update', response_invite_view.update, name='response_invite_update'),
    path('response_invite/delete', response_invite_view.delete, name='response_invite_delete'),
    path('response_invite/cancel', response_invite_view.cancel, name='response_invite_cancel'),
    path('response_invite/create', response_invite_view.create, name='response_invite_create'),
    path('resumes/<int:resume_id>', resume_view, name='resume_view'),
    path('jobs/<int:job_id>', job_view, name='job'),
    path('company/<int:company_id>', company_view, name='company'),
    path('profile/main', profile_main_view, name='profile_main'),
    path('profile/favorite', profile_favorite_view, name='profile_favorite'),
    path('profile/resume', profile_resumes_view, name='profile_resume'),
    path('profile/resume/<int:resume_id>', profile_resume_view, name='profile_resume'),
    path('profile/contact', contacts_view, name='profile_contacts'),
    path('profile/contact/<int:contact_id>', contact_view, name='profile_contacts'),
    path('profile/company', profile_company_view, name='profile_company_view'),
    path('profile/jobs', jobs_profile_view, name='profile_jobs'),
    path('profile/jobs/create', profile_job_view.create, name='profile_job_view_create'),
    path('profile/jobs/delete', profile_job_view.delete, name='profile_job_view_delete'),
    path('profile/jobs/pay_for_tier/<int:job_id>', profile_job_view.pay_for_tier, name='profile_job_view_pay_for_tier'),
    path('profile/jobs/update/<int:job_id>', profile_job_view.update, name='profile_job_view_update'),
    path('profile/wallet', profile_wallet_view, name='profile_wallet'),
    #path('update_addresses', update_addresses, name='update_addresses'),
    #path('get_btc_usd', get_btc_usd, name='get_btc_usd'),
    path('profile/customer_access', customer_access, name='customer_access'),
    path('profile/invites', profile_response_invite_view, name='profile_response_invite'),
    path('article/<int:article_id>', article_view, name='article'),
    path('chat/', include("chat.urls")),
    path('api/', include("users.urls")),
    path('activate', activate_view, name='activate_view'),

    path('admin/', admin.site.urls),
    path('swagger/',
         schema_view.with_ui('swagger', cache_timeout=0),
         name='schema-swagger-ui'),
    path('redoc/',
         schema_view.with_ui('redoc', cache_timeout=0),
         name='schema-redoc'),
]

handler404 = "contract.views.not_found_handler"


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
