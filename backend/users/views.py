from django.contrib.auth import get_user_model, login, logout
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django_filters.rest_framework import DjangoFilterBackend
from djoser.views import UserViewSet as DjoserView
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import base64

from captcha.image import ImageCaptcha
from django.shortcuts import render

from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import ERRORS
from .forms import ResumeForm, RegisterWorkerForm
from users.models.common import Captcha
from users.clients import (GetCustomerProfileSerializer,
                           PostCustomerProfileSerializer)
from users.filters import FreelancerFilter
from users.serializers.worker_serializer import (GetWorkerProfileSerializer,
                                                 PostWorkerProfileSerializer, WorkerViewSerializer)
from users.models.user import CustomerProfile, WorkerProfile, Resume
from users.permissions import IsUser, IsOwnerOrReadOnly
from users.serializers.serializers import (NewEmailSerializer,
                               PasswordResetConfirmSerializer,
                               SendEmailResetSerializer, SetPasswordSerializer,
                               UserCreateSerializer)

from django.contrib.auth import authenticate
from users.serializers.worker_serializer import ResumeSerializer
from .models.advertise import Banners

User = get_user_model()


class OnlyListView(mixins.ListModelMixin, viewsets.GenericViewSet):
    pass


class UserView(mixins.CreateModelMixin, mixins.RetrieveModelMixin,
               mixins.UpdateModelMixin, viewsets.GenericViewSet):
    pass


def captcha_check(request):
    image = SimpleCaptcha(width=280, height=90)
    challenge = Captcha.get_captcha_challenge(hash=request.POST['hashkey'])
    captcha_base64 = str(base64.b64encode(image.generate(challenge, 'png').getvalue()))
    return captcha_base64.replace("b'", '').replace("'", "")

def captcha_view(request):
    if request.method == 'POST':
        if request.POST["captcha"] is not None:
            hash = request.POST["hashkey"]
            res = Captcha.check_chaptcha(captcha=request.POST["captcha"], hash=hash)
            if res:
                page = redirect(to="index")
                page.set_cookie('captcha', hash, max_age=60*60)
                return page
            else:
                return render(request, 'captcha.html',
                              {'hashkey': hash,
                               'captcha': captcha_check(request),
                               'error': "Введена не верная каптча"})
    else:
        captcha = Captcha()
        key, hash = captcha.generate_key()
        image = SimpleCaptcha(width=280, height=120)
        captcha_base64 = str(base64.b64encode(image.generate(key, 'png').getvalue()))
        return render(request, 'captcha.html', {'hashkey': hash, 'captcha': captcha_base64.replace("b'", '').replace("'", "")})





def profile_view(request):
    error = None
    if request.method == 'GET':
        banners = Banners.objects.all()
        return render(request, 'profile.html',
                      {'banners': banners})



def register_view(request):
    if request.method == "GET":
        form = RegisterWorkerForm()
        captcha = Captcha()
        key, hash = captcha.generate_key()
        image = ImageCaptcha(width=280, height=90)
        captcha_base64 = str(base64.b64encode(image.generate(key, 'png').getvalue()))
        return render(request, 'register.html', {'form': form, 'hashkey': hash, 'captcha': captcha_base64.replace("b'", '').replace("'", "") })
    if request.method == "POST":
        form = RegisterWorkerForm(request.POST)

        if form.is_valid():
            form.save()
        return render(request, 'register.html',
                      {'form': form,
                       'hashkey': request.POST['hashkey'],
                       'captcha': captcha_check(request)})
        if request.POST["captcha"] is not None:
            hash = request.POST["hashkey"]
            res = Captcha.check_chaptcha(captcha=request.POST["captcha"], hash=hash)
            if not res:
                error = ERRORS['captcha']
                return render(request, 'register.html',
                              {'form': form,
                               'hashkey': request.POST['hashkey'],
                               'captcha':  captcha_check(request),
                               'errors': error})




def login_view(request):
    error = None
    if request.method == 'POST':
        if request.POST["captcha"] is not None:
            hash = request.POST["hashkey"]
            res = Captcha.check_chaptcha(captcha=request.POST["captcha"], hash=hash)
            if not res:
                error = ERRORS['captcha']
                return render(request, 'login.html',
                              {'hashkey': request.POST['hashkey'],
                               'captcha': captcha_check(request),
                               'error':error})
        user = authenticate(username=request.POST['login'], password=request.POST['password'])
        if user is not None:
            login(request, user)
            page = redirect(to="index")
            return page
        else:
            error = ERRORS['auth_login_pass']
            return render(request, 'login.html',
                          {'hashkey': request.POST['hashkey'], 'captcha': captcha_check(request),
                               'error':error})
    if request.method == 'GET':
        captcha = Captcha()
        key, hash = captcha.generate_key()
        image = ImageCaptcha(width=280, height=90)
        captcha_base64 = str(base64.b64encode(image.generate(key, 'png').getvalue()))
        return render(request, 'login.html',
                      {'hashkey': hash, 'captcha': captcha_base64.replace("b'", '').replace("'", "")})


class WorkerFirstPage(OnlyListView):
    queryset = WorkerProfile.objects.exclude(
        user__first_name__isnull=True
    ).exclude(
        user__last_name__isnull=True
    ).order_by(
        '-user__created_at'
    )
    serializer_class = WorkerViewSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = (SearchFilter, DjangoFilterBackend,)
    filterset_class = FreelancerFilter
    search_fields = [
        'user__first_name', 'user__last_name'
    ]


class UserViewSet(UserView):
    queryset = User.objects.all().order_by('last_name')
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
        if key == 'retrieve':
            if getattr(self, 'swagger_fake_view', False):
                return WorkerProfile.objects.none()
            user = get_object_or_404(
                User,
                id=self.kwargs.get('pk')
            )
        elif key == 'me':
            if self.request.user.is_authenticated:
                user = self.request._user
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        elif key == 'create':
            user = User.objects.all().last()
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

        if key in ['retrieve', 'me', 'partial_update']:
            if getattr(self, 'swagger_fake_view', False):
                return GetWorkerProfileSerializer

            if key in ['retrieve', 'partial_update']:
                user = get_object_or_404(
                    User,
                    id=self.kwargs.get('pk')
                )
            elif key == 'me':
                if self.request.user.is_authenticated:
                    user = self.request._user
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)

            if user.is_customer == user.is_worker:
                return Response(status=status.HTTP_400_BAD_REQUEST)

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
        return WorkerViewSerializer

    def create(self, request):
        user = super().create(request)
        queryset = self.get_queryset()
        queryset.create(user=User.objects.all().last())
        return Response(
            user.data,
            status=status.HTTP_201_CREATED
        )

    def retrieve(self, request, pk=None):
        user = get_object_or_404(User, id=pk)
        if user.is_customer == user.is_worker:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, user_id=user.id)
        if user.is_customer:
            fields = (
                'id', 'photo', 'name', 'is_customer', 'is_worker', 'industry', 'about', 'web'
            )
        if user.is_worker:
            fields = (
                'id', 'photo', 'user', 'is_customer', 'is_worker'
            )
        serializer = self.get_serializer(obj, fields=fields)
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

    @action(url_path='me', methods=['get', 'patch'], detail=False)
    def me(self, request):
        user = request._user
        if user.is_customer == user.is_worker:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset()

        if request.method == 'GET':
            obj = get_object_or_404(queryset, user_id=user.id)
            # obj, result = queryset.get_or_create(user=user)
            serializer = self.get_serializer(obj)

        if request.method == 'PATCH':
            if user.is_worker:
                fields = None
            elif user.is_customer:
                fields = (
                    'id', 'user', 'account_email', 'is_worker', 'is_customer',
                    'first_name', 'last_name', 'photo', 'name', 'industry',
                    'about', 'web'
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


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    def retrieve(self, request, pk=None):
        user = get_object_or_404(User, id=pk)
        if user.is_customer == user.is_worker:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, user_id=user.id)
        fields = (
            'id', 'salary', 'stack', 'work_experience'
        )
        serializer = self.get_serializer(obj, fields=fields)
        return Response(serializer.data)
