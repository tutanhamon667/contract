from django.shortcuts import render
from bipwallet import wallet

from btc.libs.btc_wallet import get_wallet, generate_address, get_addresses_count, get_wallet_balance
from btc.models import Address as WalletAddress
from common.models import Article, ArticleCategory


def generate_wallet():
	seed = wallet.generate_mnemonic()


def gen_address(user):
	wallet = get_wallet()
	addresses_count = get_addresses_count(wallet)
	address = generate_address(addresses_count + 1, wallet.seed)
	return address


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
				address = generate_address(addresses_count + 1, wallet.seed)
				profile_address = WalletAddress(address=address["address"], wif=address["wif"], wallet=wallet, user=user)
				profile_address.save()
			balance = get_wallet_balance(profile_address.address)
			return render(request, './blocks/profile/profile_wallet.html', {
				'wallet': profile_address,
				'balance': balance,
					'categories': categories,
					'articles': articles
			})
