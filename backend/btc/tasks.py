from celery import shared_task

from btc.libs.balance import Balance
from btc.models import Address as AddressModel
from btc.libs.btc_wallet import get_wallet
from bitcoinlib.wallets import wallet_create_or_open
from django.core.cache import cache

@shared_task
def update_addresses_balances():

	addresses = AddressModel.objects.filter()
	wallet = get_wallet()
	w = wallet_create_or_open('segwit_p2wpkh-testnet', keys=wallet.mnemonic, witness_type='segwit', network='testnet',
							  db_uri="postgresql://contract:uyfuy^6jji@localhost:5433/")
	w.scan()
	for address in addresses:
		w.scan_key(address.key_id)


@shared_task
def update_btc_usd():
	return Balance.update_btc_usd()
