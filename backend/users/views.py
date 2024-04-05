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
				redirect_url = 'index'
				if 'redirect' in request.session:
					redirect_url = request.session['redirect']
					request.session['redirect'] = None
				page = redirect(to=redirect_url)
				page.set_cookie('captcha', hash, max_age=60 * 60)
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
		return render(request, 'captcha.html',
					  {'hashkey': hash, 'captcha': captcha_base64.replace("b'", '').replace("'", "")})


def profile_view(request):
	error = None
	if request.method == 'GET':
		banners = Banners.objects.all()
		return render(request, 'profile.html',
					  {'banners': banners})




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
							   'error': error})
		user = authenticate(username=request.POST['login'], password=request.POST['password'])
		if user is not None:
			login(request, user)
			page = redirect(to="index")
			return page
		else:
			error = ERRORS['auth_login_pass']
			return render(request, 'login.html',
						  {'hashkey': request.POST['hashkey'], 'captcha': captcha_check(request),
						   'error': error})
	if request.method == 'GET':
		captcha = Captcha()
		key, hash = captcha.generate_key()
		image = ImageCaptcha(width=280, height=90)
		captcha_base64 = str(base64.b64encode(image.generate(key, 'png').getvalue()))
		return render(request, 'login.html',
					  {'hashkey': hash, 'captcha': captcha_base64.replace("b'", '').replace("'", "")})
