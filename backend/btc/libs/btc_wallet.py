from bipwallet import wallet
from bipwallet.utils import HDPrivateKey, HDKey, Wallet
from btc.models import Address, Wallet as WalletModel

import requests


def get_wallet():
	wallets = WalletModel.objects.all()
	if len(wallets) == 0:
		seed = generate_wallet()
		new_wallet = WalletModel(seed=seed)
		new_wallet.save()
		return new_wallet
	else:
		return wallets[0]

def get_addresses_count(wallet):
	addresses = Address.objects.filter(wallet=wallet)
	return len(addresses)


def generate_wallet():
	seed = wallet.generate_mnemonic()
	print(seed)
	return seed


def generate_address(index, seed):
	master_key = HDPrivateKey.master_key_from_mnemonic(seed)

	# Public key из мастер ключа по пути 'm/44/0/0/0'
	root_keys = HDKey.from_path(master_key, "m/44'/0'/0'/0")[-1].public_key.to_b58check()

	# Extended public key
	xpublic_key = root_keys

	# Адрес дочернего кошелька в зависимости от значения index
	address = Wallet.deserialize(xpublic_key, network='BTC').get_child(index, is_prime=False).to_address()

	rootkeys_wif = HDKey.from_path(master_key, f"m/44'/0'/0'/0/{index}")[-1]

	# Extended private key
	xprivatekey = rootkeys_wif.to_b58check()

	# Wallet import format
	wif = Wallet.deserialize(xprivatekey, network='BTC').export_to_wif()

	return {"address": address,"wif": wif}


def get_wallet_balance(address):
	url = f'https://blockchain.info/rawaddr/{address}'
	x = requests.get(url)
	res = x.json()
	return res['final_balance']