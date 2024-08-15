import base64

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.db import transaction
from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import CHAT_TYPE
from users.core.file_saver import FileSaver
from users.core.user import UserCore
from users.forms import RegisterWorkerForm, RegisterCustomerForm, LoginForm, RestorePasswordForm
from users.models.common import Captcha
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, authenticate
from users.models.user import Member, Company, User, UserFile
from django.contrib.auth.forms import AuthenticationForm
from btc.libs.btc_wallet import get_wallet, generate_address, get_addresses_count
from btc.models import Address as WalletAddress
from bitcoinlib.wallets import *
from django.apps import apps
from users.models.common import ModerateRequest
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from users.forms import TwoFactorAuthenticationForm

def logout_view(request):
	if request.user.is_authenticated:
		logout(request)
	return redirect(to="index")


def authenticate_view(request, template, redirect_to):
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	if request.method == "GET":
		form = LoginForm()
		if 'redirect' in request.GET and  request.GET['redirect']:
			request.session['redirect'] = request.GET['redirect']
		recovery_form = RestorePasswordForm()
		return render(request, f'pages/{template}.html',
					  {'form': form, 'recovery_form': recovery_form, 'articles': articles,
					   'categories': categories})
	if request.method == "POST":
		if request.POST.get('form_name') == 'recovery_password':
			recovery_form = RestorePasswordForm(data=request.POST)
			if recovery_form.is_valid():
				try:
					userr = Member.objects.get(login=recovery_form.cleaned_data.get('login') , recovery_code=recovery_form.cleaned_data.get('recovery_code'))\
					#generate new password
					password = userr.make_random_password()
					messages_success = 'Ваш пароль был изменён на:' + password
					form = LoginForm()
					recovery_form = RestorePasswordForm()
					return render(request, f'pages/{template}.html',
								{'form': form, 'recovery_form': recovery_form, 'articles': articles,
								'categories': categories, 'messages_success': messages_success})
				except Member.DoesNotExist:
					form = LoginForm()
					recovery_form = RestorePasswordForm()
					messages_error = 'Пользователь не найден'
					return render(request, f'pages/{template}.html',
								{'form': form, 'recovery_form': recovery_form, 'articles': articles,
								'categories':  categories, 'messages_error': messages_error})
			else:
				form = LoginForm()
				return render(request, f'pages/{template}.html',
							{'form': form, 'recovery_form': recovery_form, 'articles': articles,
							})
		else:
			form = LoginForm(data=request.POST)
			recovery_form = RestorePasswordForm()
			if form.is_valid():
				login = form.cleaned_data.get('login')
				password = form.cleaned_data.get('password')
				user_core = UserCore(User)
				res = user_core.login(username=login, password=password, request=request)
				if res:
					if 'redirect' in request.session and request.session.get('redirect'):
						redirect_to = request.session.get('redirect')
						del request.session['redirect']
					return redirect(redirect_to)
				else:
					recovery_form = RestorePasswordForm(data=request.POST)
					form.error = "Пользователь не найден"
					return render(request, f'pages/{template}.html',
								{'form': form,
								'articles': articles,
								'recovery_form': recovery_form,
								'categories': categories,
								})
			else:
				return render(request, f'pages/{template}.html',
							{'form': form,
							'articles': articles,
							'recovery_form': recovery_form,
							'categories': categories
							})


def login_worker_view(request):
	return authenticate_view(request, "login_worker", "index")


def login_customer_view(request):
	return authenticate_view(request, "login_customer", "for_customers")

def get_changed_data(new_instance, instance):
	changed_data = {}
	model = apps.get_model('users', 'company')
	for field in model._meta.fields:
		if field.name in instance:
			original_value = getattr(instance, field.name)
			form_value = getattr(new_instance, field.name)
			if original_value != form_value:
				changed_data[field.name] =  {"value":form_value, "type":"text", 'title': field.verbose_name} 
	return changed_data

@transaction.atomic
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
			form = RegisterCustomerForm(request.POST, initial={"is_customer": True})
		else:
			form = RegisterWorkerForm(request.POST, initial={"is_worker": True})
		with (transaction.atomic()):
			if form.is_valid():
				user = form.save()
				if is_customer:
					user.is_customer = True
				else:
					user.is_worker = True
				recovery_code  = Mnemonic().generate(64)
				user.recovery_code = recovery_code
				
				color = FileSaver.get_random_color()
				image = FileSaver.get_random_image()
				file = UserFile(folder='/staticfiles/users/img/profile/',name=image, extra_data={"color":color}, is_owner=False, file_type=1)
				file.save()
				user.photo = file
				user.save()
				login(request, user)

				
				if is_customer:
					company_name = request.POST.get('company_name')
					customer_company = Company(user=user, name=company_name)
					customer_company.save()
					changes = get_changed_data(customer_company, {'title':'', 'description':''})
					review_request = ModerateRequest.create_request(Company, customer_company.id, changes=changes, comment='Создание компании')
					chat = Chat.get_user_system_chat(request.user)
					chat.create_system_message(f' Создана заявка на создание компании: #{review_request.id}. Ждите проверки модератора')
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

				user = Member.objects.get(id=request.user.id)
				if user.recovery_code is None:
					return render(request, 'pages/recovery_code.html')
				else:
					return redirect(to=redirect_to)
			else:

				return render(request, f'pages/{template}.html',
							  {'form': form,
							   'articles': articles,
							   'categories': categories
							   })



@login_required
def generate_totp_qr_code(request):

    """
    Generates a TOTP QR code for the authenticated user and renders it on the 'generate_totp_qr_code.html' template.

    Parameters:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The rendered 'generate_totp_qr_code.html' template with the TOTP QR code URL.

    """
    user = request.user
    totp_device = user.totp_device
    qr_code_url = totp_device.get_qr_code_url()
    return render(request, './pages/generate_totp_qr_code.html', {'qr_code_url': qr_code_url})


@login_required
def two_factor_authentication(request):

    """
    Handles two-factor authentication for a user.

    Args:
        request: The HTTP request object.

    Returns:
        A redirect to the home page if the form is valid, otherwise a rendered HTML page with the authentication form.
    """

    if request.method == 'POST':
        form = TwoFactorAuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            return redirect('home')
    else:
        form = TwoFactorAuthenticationForm(request=request)
    return render(request, './pages/two_factor_authentication.html', {'form': form})


@login_required
def verify_totp_device(request):
    """
    Verify the TOTP device for the authenticated user.

    This function is a view that handles the verification of the TOTP device for the authenticated user.
    It requires the user to be authenticated.

    Parameters:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponseRedirect: If the TOTP token is valid, redirects the user to the 'home' page.
        HttpResponse: If the request method is not POST or the TOTP token is invalid, renders the 'verify_totp_device.html' template.

    """
    user = request.user
    totp_device = user.totp_device
    if request.method == 'POST':
        token = request.POST.get('token')
        if totp_device.verify_token(token):
            return redirect('home')
    return render(request, 'verify_totp_device.html')




def recovery_code_view(request):

	"""
	View function to handle the recovery code for a user.

	Parameters:
		request (HttpRequest): The HTTP request object.

	Returns:
		HttpResponseRedirect: Redirects the user to the 'worker_signin' page if they are not authenticated.
		HttpResponse: Renders the 'pages/recovery_code.html' template with the user's recovery code if it exists, otherwise redirects to the 'index' page.

	"""

	if (request.user.is_authenticated is False):
		return redirect('worker_signin')
	user = Member.objects.get(id=request.user.id)
	if user.recovery_code is None:
		recovery_code  = Mnemonic().generate(64)
		user.recovery_code = recovery_code
		user.save()
		return render(request, 'pages/recovery_code.html', {'recovery_code': user.recovery_code})
	return redirect('index')


def registration_customer_view(request):
	return signup_user(request, True, "signup_customer", "for_customers")


def registration_worker_view(request):
	return signup_user(request, False, "signup_worker", "index")
