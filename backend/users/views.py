from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from djoser.views import UserViewSet as DjoserView
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .freelancers import (GetEducationSerializer, GetWorkerProfileSerializer,
                          PostEducationSerializer, PostWorkerProfileSerializer,
                          UserViewSerialiser)
from .models import CustomerProfile, Education, Member, WorkerProfile
from .permissions import IsUser
from .serializers import (GetCustomerProfileSerializer, NewEmailSerializer,
                          PasswordResetConfirmSerializer,
                          PostCustomerProfileSerializer,
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
            else:
                user = self.request._user

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
            'GET_worker': None,
            'POST_PATCH_worker': None
        }
        key = self.action
        if key in ['retrieve', 'me']:
            if self.action == 'retrieve':
                user = get_object_or_404(Member, id=self.kwargs.get('pk'))
            else:
                user = self.request._user

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
        if request.method == 'PATCH':
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


class FreelancerViewSet(viewsets.ModelViewSet):
    queryset = WorkerProfile.objects.all()
    http_method_names = ["get", "post", "put", "delete"]
#    serializer_class = WorkerProfileListSerializer
    permission_classes = [permissions.AllowAny, ]

    def get_permissions(self):
        if self.action in ['create', 'update']:
            return (IsUser(),)
        return super().get_permissions()

    def get_serializer_class(self):
        # if self.action == 'list' or self.action == 'retrieve':
        # return WorkerProfileListSerializer
        if self.action == 'create' or self.action == 'update':
            return PostWorkerProfileSerializer
        return GetWorkerProfileSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    permission_classes = [permissions.AllowAny, ]

    def get_permissions(self):
        if self.action in ['create', 'update']:
            return (IsUser(),)
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'list':
            return GetEducationSerializer
        if self.action in ['create', 'update']:
            return PostEducationSerializer
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
