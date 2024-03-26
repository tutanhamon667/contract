from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("<str:chat_id>", views.index_chat, name="chat"),
    path("upload/<str:chat_id>", views.upload, name="upload"),
    path("download/<int:file_id>", views.download, name="download")
]