from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from djoser.views import UserViewSet as DjoserView
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CustomerProfile, Member, Stack, WorkerProfile
from .permissions import IsUser
from .serializers import (CustomerProfileSerializer, NewEmailSerializer,
                          PasswordResetConfirmSerializer,
                          SendEmailResetSerializer, SetPasswordSerializer,
                          UserCreateSerializer, UserViewSerialiser,
                          WorkerProfileSerializer)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('last_name')
    http_method_names = ['get', 'post', 'patch']
    token_generator = DjoserView.token_generator

    def get_permissions(self):
        if self.action == 'profile' and \
           self.request.method in ['POST', 'PATCH']:
            return (IsUser(),)
        return super().get_permissions()

    def get_queryset(self):
        if self.action == 'profile':
            user = get_object_or_404(Member, id=self.kwargs.get('pk'))
            if user.is_customer and not user.is_worker:
                return CustomerProfile.objects.all()
            elif user.is_worker and not user.is_customer:
                return WorkerProfile.objects.all()
        return super().get_queryset()

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
            user = get_object_or_404(Member, id=self.kwargs.get('pk'))
            if user.is_customer and not user.is_worker:
                return CustomerProfileSerializer
            elif user.is_worker and not user.is_customer:
                return WorkerProfileSerializer
            raise ValueError
        return UserViewSerialiser

    @action(url_path='reg_in', methods=['post'], detail=False)
    def reg_in(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
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
        DjoserView.reset_password(self, request, *args, **kwargs)
        return Response(status=status.HTTP_200_OK)

    @action(url_path='reset_password_confirm', methods=['post'], detail=False)
    def reset_password_confirm(self, request, *args, **kwargs):
        DjoserView.reset_password_confirm(self, request, *args, **kwargs)
        return Response(status=status.HTTP_200_OK)

    @action(url_path='profile', methods=['get', 'post', 'patch'], detail=True)
    def profile(self, request, pk=None):
        self.get_queryset()
        user = get_object_or_404(Member, id=pk)
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
                data=request.data
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        if request.method == 'PATCH':
            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
