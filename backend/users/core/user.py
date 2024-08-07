from users.models.user import User
from django.contrib.auth import login, authenticate
from django.db import transaction
from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from contract.settings import CHAT_TYPE
from users.core.file_saver import FileSaver

from users.forms import RegisterWorkerForm, RegisterCustomerForm, LoginForm, RestorePasswordForm
from users.models.common import Captcha
from users.models.user import Member
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
from django.contrib.auth.models import Group

class UserCore:

	def __init__(self, model):
		self.user_model = model

	@classmethod
	def login(cls, username: str, password: str, request):
		cls.error = {}
		user = authenticate(username=username, password=password)
		if user is not None:
			login(request, user)
			member = Member.objects.get(id=user.id)
			member.check_group_exists()
			return True
		else:
			cls.error = {"code": 111, "msg": "Пользователь не найден"}
			return False
	

	@classmethod
	def signup_customer(cls, request):
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
		form = RegisterCustomerForm(request.POST, initial={"is_customer": True})
		with (transaction.atomic()):
			if form.is_valid():
				user.is_customer = True
				user = form.save()
				Group.objects.get(name='customers_not_moderated').user_set.add(user)
				
				recovery_code  = Mnemonic().generate(64)
				user.recovery_code = recovery_code
				
				color = FileSaver.get_random_color()
				image = FileSaver.get_random_image()
				file = UserFile(folder='/staticfiles/users/img/profile/',name=image, extra_data={"color":color}, is_owner=False, file_type=1)
				file.save()
				user.photo = file
				user.save()
				login(request, user)
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
				moderator = Member.objects.filter(is_moderator=True)
				if len(moderator):
					chat_with_moderator = Chat(customer=user, moderator=moderator[0], type=CHAT_TYPE["VERIFICATION"])
					chat_with_moderator.save()
				return True, user
			else:
				return False, form
			
	@classmethod
	def signup_worker(cls, request):
		form = RegisterWorkerForm(request.POST, initial={"is_worker": True})
		with (transaction.atomic()):
			if form.is_valid():
				user.is_worker = True
				user = form.save()
				
				recovery_code  = Mnemonic().generate(64)
				user.recovery_code = recovery_code
				
				color = FileSaver.get_random_color()
				image = FileSaver.get_random_image()
				file = UserFile(folder='/staticfiles/users/img/profile/',name=image, extra_data={"color":color}, is_owner=False, file_type=1)
				file.save()
				user.photo = file
				user.save()
				Group.objects.get(name='worker').user_set.add(user)
				login(request, user)
			
				wallet = get_wallet()
				addresses_count = get_addresses_count(wallet)
				address = generate_address(addresses_count + 1, wallet.mnemonic)
				new_address = WalletAddress(address=address["address"], key_id=address["key_id"], wif=address["wif"], wallet=wallet, user=user)
				new_address.save()
				return True, user
			else:
				return False, form