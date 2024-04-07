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
from users.models.common import Captcha

from django.contrib.auth import authenticate

from .forms import CaptchaForm
from .models.advertise import Banners

User = get_user_model()

class OnlyListView(mixins.ListModelMixin, viewsets.GenericViewSet):
	pass


class UserView(mixins.CreateModelMixin, mixins.RetrieveModelMixin,
			   mixins.UpdateModelMixin, viewsets.GenericViewSet):
	pass


def captcha_view(request):
	if request.method == 'POST':
		form = CaptchaForm(request.POST)
		if form.is_valid():
			redirect_url = 'index'
			if 'redirect' in request.session:
				redirect_url = request.session['redirect'] or 'index'
				request.session['redirect'] = None
			page = redirect(to=redirect_url)
			page.set_cookie('captcha', hash, max_age=60 * 60)
			return page
		else:
			return render(request, 'captcha.html',
						  {"form": form})
	else:
		form = CaptchaForm()
		return render(request, 'captcha.html',
					  {'form': form})


def profile_view(request):
	error = None
	if request.method == 'GET':
		banners = Banners.objects.all()
		return render(request, 'profile.html',
					  {'banners': banners})


