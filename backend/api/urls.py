from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import JobCategoryViewSet, JobViewSet
from users.views import UserViewSet

app_name = 'api'

router_v1 = DefaultRouter()
router_v1.register(r'jobs', JobViewSet, basename='jobs')
router_v1.register(r'category', JobCategoryViewSet, basename='category')
router_v1.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router_v1.urls)),
    path('login/', include('djoser.urls.jwt')),
]
