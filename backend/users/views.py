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
from .models import CustomerProfile, Member, WorkerProfile
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
        if self.action in ['retrieve', 'me']:
            if self.action == 'retrieve':
                user = get_object_or_404(Member, id=self.kwargs.get('pk'))
            elif self.request.user.is_authenticated:
                user = self.request._user
            else:
                return super().get_queryset()

            if user.is_customer and not user.is_worker:
                return CustomerProfile.objects.all()
            if user.is_worker and not user.is_customer:
                return WorkerProfile.objects.all()
        return super().get_queryset()

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
            if self.action == 'retrieve':
                user = get_object_or_404(Member, id=self.kwargs.get('pk'))
            elif self.request.user.is_authenticated:
                user = self.request._user
            else:
                return UserViewSerialiser

            if user.is_customer and not user.is_worker:
                if self.request.method in ['POST', 'PATCH']:
                    key = 'POST_PATCH_customer'
                else:
                    key = 'GET_customer'
            elif user.is_worker and not user.is_customer:
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
        self.get_queryset()
        user = get_object_or_404(Member, id=self.kwargs.get('pk'))
        if user.is_customer and not user.is_worker:
            queryset = get_object_or_404(CustomerProfile, user_id=user.id)
        elif user.is_worker and not user.is_customer:
            queryset = get_object_or_404(WorkerProfile, user_id=user.id)
        serializer = self.get_serializer(queryset)
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
        self.get_queryset()
        user = request._user
        if request.method == 'GET':
            if user.is_customer and not user.is_worker:
                queryset = get_object_or_404(CustomerProfile, user_id=user.id)
            elif user.is_worker and not user.is_customer:
                queryset = get_object_or_404(WorkerProfile, user_id=user.id)
            serializer = self.get_serializer(queryset)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        self.get_permissions()
        if request.method == 'POST':
            if user.is_customer and not user.is_worker:
                serializer = self.get_serializer(
                    data=request.data,
                    fields=('user', 'photo', 'name', 'industry', 'web')
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )
            if user.is_worker and not user.is_customer:
                serializer = self.get_serializer(
                    data=request.data
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )
        if request.method == 'PATCH':
            print(request._user)
            serializer = self.get_serializer(
                request._user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK)
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
