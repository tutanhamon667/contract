import base64

from django.shortcuts import render, redirect
from django.db import transaction
from chat.models import Chat
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import CHAT_TYPE
from users.core.user import UserCore
from users.forms import RegisterWorkerForm, RegisterCustomerForm
from users.models.common import Captcha
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, authenticate
from users.models.user import Member, Company, User
from django.contrib.auth.forms import AuthenticationForm
from btc.libs.btc_wallet import get_wallet, generate_address, get_addresses_count
from btc.models import Address as WalletAddress


def logout_view(request):
	if request.user.is_authenticated:
		logout(request)
	return redirect(to="index")


def login_view(request):
	if request.method == "GET":
		form = AuthenticationForm()
		key, hash_key = Captcha().generate_key()
		captcha_base64 = SimpleCaptcha(width=280, height=90).get_base64(key)
		return render(request, 'login.html', {'form': form, 'hashkey': hash_key, 'captcha': captcha_base64})
	if request.method == "POST":
		form = AuthenticationForm(request, data=request.POST)
		hash_key = request.POST.get("hashkey")
		res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
		if not res:
			messages.error(request, "Unsuccessful login.Captcha Invalid .")
			return render(request, 'login.html',
						  {'form': form,
						   'hashkey': hash_key,
						   'captcha': SimpleCaptcha.captcha_check(request)})

		if form.is_valid():
			username = form.cleaned_data.get('username')
			password = form.cleaned_data.get('password')
			user_core = UserCore(User)
			res = user_core.login(username=username, password=password, request=request)
			if res:
				messages.info(request, f"You are now logged in as {username}.")
				return redirect("index")
			else:
				messages.error(request, res.error["msg"])
				return render(request, 'login.html',
							  {'form': form,
							   'hashkey': hash_key,
							   'captcha': SimpleCaptcha.captcha_check(request)})
		else:
			messages.error(request, "Invalid username or password.")
			return render(request, 'login.html',
						  {'form': form,
						   'hashkey': hash_key,
						   'captcha': SimpleCaptcha.captcha_check(request)})


def registration_customer_view(request):
	if request.method == "GET":
		form = RegisterCustomerForm(initial={"is_customer": True})
		captcha = Captcha()
		key, hash_key = captcha.generate_key()
		image = SimpleCaptcha(width=280, height=90)
		captcha_base64 = image.get_base64(key)
		return render(request, 'register.html', {'form': form, 'hashkey': hash_key, 'captcha': captcha_base64})
	if request.method == "POST":
		form = RegisterCustomerForm(request.POST)

		hash_key = request.POST.get("hashkey")
		res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
		if not res:
			messages.error(request, "Unsuccessful registration.Captcha Invalid .")
			return render(request, 'register.html',
						  {'form': form,
						   'hashkey': hash_key,
						   'captcha': SimpleCaptcha.captcha_check(request)})
		if form.is_valid():
			with transaction.atomic():
				user = form.save()
				login(request, user)
				messages.success(request, "Registration successful.")
				company_name = request.POST.get('company_name') or None
				customer_company = Company(user=user, name=company_name)
				customer_company.save()
				wallet = get_wallet()
				addresses_count = get_addresses_count(wallet)
				address = generate_address(addresses_count + 1, wallet.mnemonic)
				new_address = WalletAddress(address=address["address"], wif=address["wif"], wallet=wallet, user=user)
				new_address.save()
				moderator = Member.objects.filter(is_moderator=True)
				chat_with_moderator = Chat(customer=user, moderator=moderator[0], type=CHAT_TYPE["VERIFICATION"])
				chat_with_moderator.save()
				return redirect(to='index')
		else:
			messages.error(request, "Unsuccessful registration. Invalid information.")
			return render(request, 'register.html',
						  {'form': form,
						   'hashkey': request.POST['hashkey'],
						   'captcha': SimpleCaptcha.captcha_check(request)})


def registration_worker_view(request):
	if request.method == "GET":
		form = RegisterWorkerForm(initial={"is_worker": True})
		captcha = Captcha()
		key, hash_key = captcha.generate_key()
		image = SimpleCaptcha(width=280, height=90)
		captcha_base64 = image.get_base64(key)
		return render(request, 'register.html', {'form': form, 'hashkey': hash_key, 'captcha': captcha_base64})
	if request.method == "POST":
		form = RegisterWorkerForm(request.POST)

		hash_key = request.POST.get("hashkey")
		res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
		if not res:
			messages.error(request, "Unsuccessful registration.Captcha Invalid .")
			return render(request, 'register.html',
						  {'form': form,
						   'hashkey': hash_key,
						   'captcha': SimpleCaptcha.captcha_check(request)})
		if form.is_valid():
			with transaction.atomic():
				user = form.save()
				user.is_moderated = True
				user.save()
				login(request, user)
				messages.success(request, "Registration successful.")
				worker_profile = Member(id=user.id)
				worker_profile.save()
				wallet = get_wallet()
				addresses_count = get_addresses_count(wallet)
				address = generate_address(addresses_count + 1, wallet.mnemonic)
				new_address = WalletAddress(address=address["address"], wif=address["wif"], wallet=wallet, user=worker_profile)
				new_address.save()
				return redirect(to='index')

		else:
			messages.error(request, "Unsuccessful registration. Invalid information.")
		return render(request, 'register.html',
					  {'form': form,
					   'hashkey': request.POST['hashkey'],
					   'captcha': SimpleCaptcha.captcha_check(request)})
