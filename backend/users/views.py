from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from djoser import views as djoser_views
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Skil, Worker
from .permissions import IsUser
from .serializers import (SetPasswordSerializer, UserCreateSerializer,
                          UserViewSerialiser, NewEmailSerializer)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
#    serializer_class = UserViewSerialiser
    queryset = User.objects.all()
    http_method_names = ['get', 'post']

    def get_serializer_class(self):
        if action == 'reg_in':
            return UserCreateSerializer
        return UserViewSerialiser

    @action(url_path='reg_in', methods=['post'], detail=False)
    def reg_in(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('is_customer') == \
                serializer.validated_data.get('is_worker'):
            raise serializers.ValidationError(
                'Нужно выбрать "Фрилансер" или "Заказчик'
                )
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(url_path='new_email', methods=['post'], detail=False,
            permission_classes=(IsUser,))
    def new_email(self, request):
        serializer = NewEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return

    @action(url_path='new_password', methods=['post'], detail=False,
            permission_classes=(IsUser,))
    def new_password(self, request, pk=None):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.request.user.set_password(serializer.data["new_password"])
        self.request.user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
