import datetime

from django.shortcuts import render, redirect
from django.utils import timezone
from django.core.cache import cache
from django.contrib.contenttypes.models import ContentType
from users.models.user import Member
from btc.libs.balance import Balance
from btc.libs.btc_wallet import get_wallet, generate_address, get_addresses_count, get_wallet_balance, \
	create_transaction, get_qrcode
from btc.models import Address as WalletAddress, CustomerAccessPayment, Operation, Address
from btc.tasks import update_addresses_balances, update_btc_usd
from common.models import Article, ArticleCategory

from django.http import JsonResponse, HttpResponse

from contract.settings import OPERATION_STATUS

from dateutil.relativedelta import relativedelta
from django.db import transaction

def update_addresses(request):
	update_addresses_balances()
	return JsonResponse({'foo': 'bar'})


def get_btc_usd(request):
	res = Balance.update_btc_usd()
	return JsonResponse({'btc_usd': res})


@transaction.atomic
def customer_access(request):
	user = request.user
	if user.is_authenticated:
		today = datetime.datetime.now()
		customer_access = CustomerAccessPayment.objects.filter(start_at__lte=timezone.now(),
															   expire_at__gte=timezone.now(), user=user)
		if len(customer_access) == 0:
			member = Member.objects.get(id=user.id)
			if member.is_worker:
				return HttpResponse(status=403)
			d1 = timezone.now()
			expire_date = d1 + relativedelta(months=1)
			ca = CustomerAccessPayment(user=user, start_at=d1, expire_at=expire_date, amount_id=1)
			ca.save()
			address = Address.objects.get(user=user)
			customer_access_content_type = ContentType.objects.get_for_model(CustomerAccessPayment)
			new_operation = Operation(address=address, cost_btc=0, cost_usd=0,  status=0, paid_at=d1,
									  reason_content_type=customer_access_content_type, reason_object_id=ca.id)
			new_operation.save()
			return redirect('profile_wallet')
		else:
			return redirect('index')
	else:
		return redirect('signin')

def profile_wallet_view(request):
	if request.user.is_authenticated:
		user = request.user
		if user.is_worker:
			return redirect('index')
		articles = Article.objects.all()
		categories = ArticleCategory.objects.all()
		if request.method == "GET":
			profile_address = None
			address = WalletAddress.objects.filter(user=user.id)
			if len(address) > 0:
				profile_address = address[0]
			else:
				wallet = get_wallet()
				addresses_count = get_addresses_count(wallet)
				address = generate_address(addresses_count + 1, wallet.mnemonic)
				profile_address = WalletAddress(address=address["address"], wif=address["wif"], key_id=address["key_id"], wallet=wallet, user=user)
				profile_address.save()
			operations = Operation.objects.filter(address=profile_address)
			balance = Balance(profile_address, operations)
			get_qrcode(profile_address.address)
			return render(request, './blocks/profile/profile_wallet.html', {
				'balance': balance,
				'categories': categories,
				'articles': articles
			})
	else:
		return redirect('signin')
