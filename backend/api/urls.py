from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import (ChatViewSet, JobCategoryViewSet, JobViewSet,
                       MessageViewSet)
from users.views import FreelancerFirstPage, UserViewSet

app_name = 'api'

router_v1 = DefaultRouter()
router_v1.register(r'jobs', JobViewSet, basename='jobs')
router_v1.register(r'category', JobCategoryViewSet, basename='category')
router_v1.register(r'users', UserViewSet, basename='users')
router_v1.register(r'main', FreelancerFirstPage, basename='main')
router_v1.register(r'chats', ChatViewSet)
router_v1.register(r'chats/(?P<chat_id>[0-9]+)/messages',
                   MessageViewSet,
                   basename='message'
                   )

urlpatterns = [
    path('', include(router_v1.urls)),
    path('login/', include('djoser.urls.jwt')),
]
