from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('auth/', include('djoser.urls')),
    path('api/v1/', include('users.urls')),
    # path('api/', include('tasks.urls'))
    path('api/', include('api.urls')),
]
