import qrcode
from bit import PrivateKeyTestnet
from django.core.files.storage import default_storage, FileSystemStorage
from hdwallet import HDWallet
from hdwallet.utils import generate_entropy, generate_mnemonic
from hdwallet.symbols import BTCTEST as SYMBOL
from typing import Optional

from bitcoinlib.wallets import *
from bitcoinlib.keys import HDKey
from time import sleep


import json

from btc.celery import app
from btc.models import Address as AddressModel, Wallet as WalletModel

import requests

from users.models.user import Member


def get_wallet():
	wallets = WalletModel.objects.all()
	if len(wallets) == 0:
		passphrase = Mnemonic().generate()
		print(passphrase)
		w = wallet_create_or_open('segwit_p2wpkh-testnet', keys=passphrase, witness_type='segwit', network='testnet',db_uri="postgresql://contract:uyfuy^6jji@localhost:5433/")
		accounts = w.accounts("testnet")
		if len(accounts) == 0:
			w.new_account("Main testnet BTC")

		new_wallet = WalletModel(mnemonic=passphrase)
		new_wallet.save()
		return new_wallet
	else:
		return wallets[0]

def get_addresses_count(wallet):
	addresses = AddressModel.objects.filter(wallet=wallet)
	return len(addresses)


def generate_wallet():
	seed: str = generate_entropy()
	return seed


def generate_address(index, mnemonic):
	w1 = wallet_create_or_open('segwit_p2wpkh-testnet', keys=mnemonic, witness_type='segwit', network='testnet',db_uri="postgresql://contract:uyfuy^6jji@localhost:5433/")
	new_key6b = w1.key_for_path(path="m/84'/1'/0'/0/" + str(index), network='testnet')
	img = qrcode.make(new_key6b.address)
	img.save("media/qrcode_addresses/"+new_key6b.address+".png")
	return {"address": new_key6b.address,"wif": new_key6b.wif, "key_id": new_key6b.key_id}


def create_transaction(user_id, tx_amount):
	script_type_default('segwit', locking_script=True)
	wallet = get_wallet()
	address = AddressModel.objects.get(user_id=user_id)
	key = address.get_key_info()
	w2 = wallet_create_or_open('segwit_p2wpkh-testnet', keys=wallet.mnemonic, witness_type='segwit', network='testnet',db_uri="postgresql://contract:uyfuy^6jji@localhost:5433/")
	w2_key = w2.key_for_path(key[17])

	# Кошелек куда будут переведены деньги
	output = 'tb1qyz8wndsex2qn7eapxqlk759xmmf5gkc80y52nh'
	tx_fee = 70
	print(w2.scan_key(w2_key))
	print(w2_key.balance())
	if not w2_key.balance():
		print("No UTXO'S found, please make a test-bitcoin deposit to %s. Minimum amount needed is %d sathosi" %
			  (w2_key.address, (1 * (10 + tx_amount))))
	else:
		print("Open balance: %s" % w2.balance())
		if w2_key.balance() < ((tx_fee + tx_amount) * 4):
			print("Balance to low, please deposit at least %s to %s" %
				  (((tx_fee + tx_amount) * 4) - w2_key.balance(), w2_key.address))
		print("Sending transaction from wallet #1 to wallet #2:")
		w2.transaction_create()
		t = w2.send_to(to_address=output, amount=tx_amount, offline=False, input_key_id=address.key_id)
		t.info()




def get_wallet_balance(address):
	url = f'https://api.blockcypher.com/v1/btc/test3/addrs/{address}/balance'
	x = requests.get(url)
	res = x.json()
	return res['final_balance']