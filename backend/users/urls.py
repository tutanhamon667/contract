from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import FreelancerViewSet, TestViewSet, UserViewSet

router = SimpleRouter()
router.register('users', UserViewSet)
router.register('freelancers', FreelancerViewSet)
router.register('test', TestViewSet)
# router.register('profile', WorkerProfileviewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('login/', include('djoser.urls.jwt')),
]
