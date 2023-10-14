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
        if self.action == 'retrieve':
            user = get_object_or_404(User, id=self.kwargs.get('pk'))
        elif self.action == 'me':
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
        serializers = {
            'reg_in': UserCreateSerializer,
            'new_email': NewEmailSerializer,
            'new_password': SetPasswordSerializer,
            'reset_password': SendEmailResetSerializer,
            'reset_password_confirm': PasswordResetConfirmSerializer,
            'GET_customer': GetCustomerProfileSerializer,
            'POST_PATCH_customer': PostCustomerProfileSerializer,
            'GET_worker': GetWorkerProfileSerializer,
            'POST_PATCH_worker': PostWorkerProfileSerializer
        }
        key = self.action
        if key in ['retrieve', 'me']:
            if key == 'retrieve':
                user = get_object_or_404(User, id=self.kwargs.get('pk'))
            elif self.request.user.is_authenticated:
                user = self.request._user
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)

            if user.is_customer:
                if self.request.method in ['POST', 'PATCH']:
                    key = 'POST_PATCH_customer'
                else:
                    key = 'GET_customer'
            elif user.is_worker:
                if self.request.method in ['POST', 'PATCH']:
                    key = 'POST_PATCH_worker'
                else:
                    key = 'GET_worker'
            else:
                raise ValueError('Роль пользователя не определена')
        try:
            return (serializers[key])
        except KeyError:
            return UserViewSerialiser

    def create(self, request, *args, **kwargs):
        """
        Метод POST запрещён для endpoint /users/
        """
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, request, *args, **kwargs):
        user = get_object_or_404(User, id=self.kwargs.get('pk'))
        if user.is_customer == user.is_worker:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if user.is_customer:
            queryset = get_object_or_404(CustomerProfile, user_id=user.id)
        elif user.is_worker:
            queryset = get_object_or_404(WorkerProfile, user_id=user.id)
        serializer = self.get_serializer(queryset)
        self.get_queryset()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """
        Метод PATCH разрешён только для endpoint /me/
        """
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(url_path='reg_in', methods=['post'], detail=False)
    def reg_in(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(url_path='new_email', methods=['post'], detail=False)
    def new_email(self, request):
        self.get_permissions()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.request.user.email = serializer.data["new_email"]
        self.request.user.save()
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @action(url_path='new_password', methods=['post'], detail=False)
    def new_password(self, request):
        self.get_permissions()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.request.user.set_password(serializer.data["new_password"])
        self.request.user.save()
        return Response(status=status.HTTP_200_OK)

    @action(url_path='reset_password', methods=['post'], detail=False)
    def reset_password(self, request, *args, **kwargs):
        DjoserView.reset_password(self, request, *args, **kwargs)
        return Response(status=status.HTTP_200_OK)

    @action(url_path='reset_password_confirm', methods=['post'], detail=False)
    def reset_password_confirm(self, request, *args, **kwargs):
        DjoserView.reset_password_confirm(self, request, *args, **kwargs)
        return Response(status=status.HTTP_200_OK)

    @action(url_path='me', methods=['get', 'post', 'patch'], detail=False)
    def me(self, request):
        user = request._user
        if user.is_customer == user.is_worker:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        self.get_permissions()
        self.get_queryset()

        if user.is_customer:
            if request.method == 'GET':
                queryset = get_object_or_404(CustomerProfile, user_id=user.id)
                serializer = self.get_serializer(queryset)
            elif request.method == 'POST':
                serializer = self.get_serializer(
                    data=request.data,
                    fields=('user', 'photo', 'name', 'industry', 'web')
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()

        elif user.is_worker:
            if request.method == 'GET':
                queryset = get_object_or_404(WorkerProfile, user_id=user.id)
                serializer = self.get_serializer(queryset)
            elif request.method == 'POST':
                serializer = self.get_serializer(
                    data=request.data
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
            elif request.method == 'PATCH':
                serializer = self.get_serializer(
                    request._user,
                    request.data,
                    partial=True
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
