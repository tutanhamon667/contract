from django.urls import path

from .controllers.api import *


urlpatterns = [
    path("favorite", favorite_job, name="favorite")
]