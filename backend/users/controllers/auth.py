import base64

from django.shortcuts import render, redirect
from django.db import transaction
from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import CHAT_TYPE
from users.core.user import UserCore
from users.forms import RegisterWorkerForm, RegisterCustomerForm, LoginForm
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


def authenticate_view(request, template, redirect_to):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	if request.method == "GET":
		form = LoginForm()
		return render(request, f'pages/{template}.html',
					  {'form': form, 'articles': articles,
					   'categories': categories})
	if request.method == "POST":
		form = LoginForm(data=request.POST)
		if form.is_valid():
			login = form.cleaned_data.get('login')
			password = form.cleaned_data.get('password')
			user_core = UserCore(User)
			res = user_core.login(username=login, password=password, request=request)
			if res:
				return redirect(redirect_to)
			else:
				form.error = "Пользователь не найден"
				return render(request, f'pages/{template}.html',
							  {'form': form,
							   'articles': articles,
							   'categories': categories,
							   })
		else:
			return render(request, f'pages/{template}.html',
						  {'form': form,
						   'articles': articles,
						   'categories': categories
						   })


def login_worker_view(request):
	return authenticate_view(request, "login_worker", "index")


def login_customer_view(request):
	return authenticate_view(request, "login_customer", "for_customers")


def signup_user(request, is_customer, template, redirect_to):


	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	if request.method == "GET":
		if is_customer:
			form = RegisterCustomerForm(initial={"is_customer": True})
		else:
			form = RegisterWorkerForm(initial={"is_worker": True})
		return render(request, f'pages/{template}.html', {'form': form,
												 'articles': articles,
												 'categories': categories
												 })
	if request.method == "POST":
		if is_customer:
			form = RegisterCustomerForm(request.POST)
		else:
			form = RegisterWorkerForm(request.POST)
		with (transaction.atomic()):
			if form.is_valid():
				user = form.save()
				login(request, user)
				if is_customer:
					company_name = request.POST.get('company_name')
					customer_company = Company(user=user, name=company_name)
					customer_company.save()
				wallet = get_wallet()
				addresses_count = get_addresses_count(wallet)
				address = generate_address(addresses_count + 1, wallet.mnemonic)
				new_address = WalletAddress(address=address["address"], key_id=address["key_id"], wif=address["wif"], wallet=wallet, user=user)
				new_address.save()
				if is_customer:
					moderator = Member.objects.filter(is_moderator=True)
					if len(moderator):
						chat_with_moderator = Chat(customer=user, moderator=moderator[0], type=CHAT_TYPE["VERIFICATION"])
						chat_with_moderator.save()

				return redirect(to=redirect_to)
			else:

				return render(request, f'pages/{template}.html',
							  {'form': form,
							   'articles': articles,
							   'categories': categories
							   })


def registration_customer_view(request):
	return signup_user(request, True, "signup_customer", "for_customers")


def registration_worker_view(request):
	return signup_user(request, False, "signup_worker", "index")
