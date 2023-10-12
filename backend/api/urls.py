from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import CategoryViewSet, JobViewSet
from users.views import FreelancerViewSet, UserViewSet

app_name = 'api'

router_v1 = DefaultRouter()
router_v1.register(r'freelancers', FreelancerViewSet, basename='freelancers')
router_v1.register(r'jobs', JobViewSet, basename='jobs')
router_v1.register(r'category', CategoryViewSet, basename='category')
router_v1.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router_v1.urls)),
    path('login/', include('djoser.urls.jwt')),
]
