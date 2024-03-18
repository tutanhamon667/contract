import requests
from django.core.cache import cache
from btc.models import Address as AddressModel, Operation


class Balance:
	def __init__(self, user):
		self.output_transactions = []
		self.operations = []
		self.paid_value = 0
		self.address = AddressModel.objects.get(user=user)
		self.balance_btc = float(self.address.get_address_incoming_transactions_value() / 100000000 or 0)
		self.btc_usd_cost = cache.get("btc_usd")
		if self.btc_usd_cost is None:
			self.btc_usd_cost = Balance.update_btc_usd()
		self.balance_usd = round(self.balance_btc * self.btc_usd_cost, 2)
		self.get_output_transactions()
		self.get_paid_operations()

	def check_payment(self, amount_btc):
		return self.balance_btc - amount_btc

	@classmethod
	def update_btc_usd(cls, symbol="USD"):
		url = f'https://blockchain.info/ticker'
		x = requests.get(url)
		res = x.json()
		value = res[symbol]["last"]
		cache.set("btc_usd", value)
		return value

	def convert_btc_usd(self, btc):
		converted_btc = float(btc / 100000000 or 0)
		self.btc_usd_cost = cache.get("btc_usd")
		if self.btc_usd_cost is None:
			self.btc_usd_cost = Balance.update_btc_usd()
		converted_usd = round(converted_btc * self.btc_usd_cost, 2)
		return converted_btc, converted_usd

	def get_output_transactions(self):
		output_transactions = self.address.get_address_incoming_transactions()
		self.output_transactions = []
		for output_transaction in output_transactions:
			output_transaction["value"], usd = self.convert_btc_usd(output_transaction["value"])
			self.output_transactions.append(output_transaction)
		return self.output_transactions

	def get_paid_operations(self):
		operations = Operation.objects.filter(address=self.address)
		for operation in operations:
			self.paid_value = self.paid_value + operation.cost_btc
		self.operations = operations
		return self.operations

	@property
	def get_final_balance_btc(self):
		return float(self.balance_btc) - float(self.paid_value)

	@property
	def get_final_balance_usd(self):
		converted_btc, converted_usd = self.convert_btc_usd(self.get_final_balance_btc*100000000)
		return converted_usd



