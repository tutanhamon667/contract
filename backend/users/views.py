from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from djoser.views import UserViewSet as DjoserView
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .clients import (GetCustomerProfileSerializer,
                      PostCustomerProfileSerializer)
from .freelancers import (GetWorkerProfileSerializer,
                          PostWorkerProfileSerializer, UserViewSerialiser)
from .models import CustomerProfile, WorkerProfile
from .permissions import IsUser
from .serializers import (NewEmailSerializer, PasswordResetConfirmSerializer,
                          SendEmailResetSerializer, SetPasswordSerializer,
                          UserCreateSerializer)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_worker=True).order_by('last_name')
    http_method_names = ['get', 'post', 'patch']
    token_generator = DjoserView.token_generator
    permission_classes = (permissions.AllowAny,)

    def get_permissions(self):
        if self.action in ['me', 'new_email', 'new_password']:
            return (IsUser(),)
        return super().get_permissions()

    def get_queryset(self):
        """"
        action in ['retrieve', 'me']  дополнительно проверяет роль
        пользователя и в зависимости от этого возвращает требуемый queryset
        """
        key = self.action
        if key == 'partial_update':
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        if key == 'retrieve':
            user = get_object_or_404(
                User,
                id=self.kwargs.get('pk')
            )
        elif key == 'me':
            if self.request.user.is_authenticated:
                user = self.request._user
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return super().get_queryset()

        if user.is_customer:
            return CustomerProfile.objects.all()
        if user.is_worker:
            return WorkerProfile.objects.all()
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        """"
        action in ['retrieve', 'me'] дополнительно проверяет роль
        пользователя и в зависимости от этого возвращает требуемый serializer
        """
        key = self.action
        if key == 'partial_update':
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        if key == 'create':
            return UserCreateSerializer
        if key == 'reset_password':
            return SendEmailResetSerializer
        if key == 'reset_password_confirm':
            return PasswordResetConfirmSerializer
        if key == 'new_email':
            return NewEmailSerializer
        if key == 'new_password':
            return SetPasswordSerializer

        if key in ['retrieve', 'me']:
            if key == 'retrieve':
                user = get_object_or_404(
                    User,
                    id=self.kwargs.get('pk')
                )
            elif key == 'me':
                if self.request.user.is_authenticated:
                    user = self.request._user
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)

            if self.request.method in ['POST', 'PATCH']:
                if user.is_customer:
                    return PostCustomerProfileSerializer
                if user.is_worker:
                    return PostWorkerProfileSerializer
            if self.request.method == 'GET':
                if user.is_customer:
                    return GetCustomerProfileSerializer
                if user.is_worker:
                    return GetWorkerProfileSerializer
        #    return Response(status=status.HTTP_400_BAD_REQUEST)
        return UserViewSerialiser

    def retrieve(self, request, pk=None):
        user = get_object_or_404(User, id=pk)
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, user_id=user.id)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        """
        Метод PATCH разрешён только для endpoint /me/
        """
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(url_path='new_email', methods=['post'], detail=False)
    def new_email(self, request, *args, **kwargs):
        return DjoserView.set_username(self, request, *args, **kwargs)

    @action(url_path='new_password', methods=['post'], detail=False)
    def new_password(self, request, *args, **kwargs):
        return DjoserView.set_password(self, request, *args, **kwargs)

    @action(url_path='reset_password', methods=['post'], detail=False)
    def reset_password(self, request, *args, **kwargs):
        return DjoserView.reset_password(self, request, *args, **kwargs)

    @action(url_path='reset_password_confirm', methods=['post'], detail=False)
    def reset_password_confirm(self, request, *args, **kwargs):
        return DjoserView.reset_password_confirm(
            self, request, *args, **kwargs
        )

    @action(url_path='me', methods=['get', 'post', 'patch'], detail=False)
    def me(self, request):
        user = request._user
        if user.is_customer == user.is_worker:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset()

        if request.method == 'GET':
            obj = get_object_or_404(queryset, user_id=user.id)
            # obj, result = queryset.get_or_create(user=user)
            serializer = self.get_serializer(obj)
        if request.method == 'POST':
            if user.is_worker:
                fields = None
            elif user.is_customer:
                fields = (
                    'user', 'account_email', 'is_worker', 'is_customer',
                    'photo', 'name', 'industry', 'about', 'web'
                )
            serializer = self.get_serializer(
                data=request.data,
                fields=fields
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        if request.method == 'PATCH':
            if user.is_worker:
                fields = None
            elif user.is_customer:
                fields = (
                    'user', 'account_email', 'is_worker', 'is_customer',
                    'photo', 'name', 'industry', 'about', 'web'
                )
            serializer = self.get_serializer(
                request._user,
                data=request.data,
                fields=fields,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
