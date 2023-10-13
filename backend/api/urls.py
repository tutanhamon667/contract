from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import JobCategoryViewSet, JobViewSet

app_name = 'api'

router_v1 = DefaultRouter()
router_v1.register(r'jobs', JobViewSet, basename='jobs')
router_v1.register(r'category', JobCategoryViewSet, basename='category')

urlpatterns = [
    path('v1/', include(router_v1.urls)),
]
