from django.shortcuts import render

from django.core.cache import cache

from btc.libs.balance import Balance
from btc.libs.btc_wallet import get_wallet, generate_address, get_addresses_count, get_wallet_balance, \
	create_transaction
from btc.models import Address as WalletAddress
from btc.tasks import update_addresses_balances, update_btc_usd
from common.models import Article, ArticleCategory

from django.http import JsonResponse


def update_addresses(request):
	update_addresses_balances()
	return JsonResponse({'foo': 'bar'})


def get_btc_usd(request):
	res = Balance.update_btc_usd()
	return JsonResponse({'btc_usd': res})

def profile_wallet_view(request):
	if request.user.is_authenticated:
		user = request.user
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
			balance = Balance(user)
			balance.get_output_transactions()
			return render(request, './blocks/profile/profile_wallet.html', {
				'balance': balance,
				'categories': categories,
				'articles': articles
			})
