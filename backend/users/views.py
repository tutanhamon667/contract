from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from djoser.views import UserViewSet as djoser_view
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Stack, WorkerProfile
from .permissions import IsUser
from .serializers import (NewEmailSerializer, PasswordResetConfirmSerializer,
                          SendEmailResetSerializer, SetPasswordSerializer,
                          UserCreateSerializer, UserViewSerialiser,
                          WorkerProfileSerializer)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('last_name')
    http_method_names = ['get', 'post']
    token_generator = djoser_view.token_generator

    def get_serializer_class(self):
        if self.action == 'reg_in':
            return UserCreateSerializer
        if self.action == 'new_email':
            return NewEmailSerializer
        if self.action == 'new_password':
            return SetPasswordSerializer
        if self.action == 'reset_password':
            return SendEmailResetSerializer
        if self.action == 'reset_password_confirm':
            return PasswordResetConfirmSerializer
        if self.action == 'profile':
            return WorkerProfileSerializer
        return UserViewSerialiser

    @action(url_path='reg_in', methods=['post'], detail=False)
    def reg_in(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('is_customer') == \
                serializer.validated_data.get('is_worker'):
            raise serializers.ValidationError(
                'Нужно выбрать "Фрилансер" или "Заказчик'
            )
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(url_path='new_email', methods=['post'], detail=False,
            permission_classes=(IsUser,))
    def new_email(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.request.user.email = serializer.data["new_email"]
        self.request.user.save()
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @action(url_path='new_password', methods=['post'], detail=False,
            permission_classes=(IsUser,))
    def new_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.request.user.set_password(serializer.data["new_password"])
        self.request.user.save()
        return Response(status=status.HTTP_200_OK)

    @action(url_path='reset_password', methods=['post'], detail=False)
    def reset_password(self, request, *args, **kwargs):
        djoser_view.reset_password(self, request, *args, **kwargs)
        return Response(status=status.HTTP_200_OK)

    @action(url_path='reset_password_confirm', methods=['post'], detail=False)
    def reset_password_confirm(self, request, *args, **kwargs):
        djoser_view.reset_password_confirm(self, request, *args, **kwargs)
        return Response(status=status.HTTP_200_OK)

    @action(url_path='profile', methods=['get', 'post'], detail=True)
    def profile(self, request, pk=None):
        if request.method == 'GET':
            queryset = WorkerProfile.objects.get(user=pk)
            serializer = self.get_serializer(queryset)
            return Response(serializer.data,
                            status=status.HTTP_200_OK)
        if request.method == 'POST':
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid()
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK)
