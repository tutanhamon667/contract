import requests
from django.core.cache import cache


class Balance:
	def __init__(self, address, operations):
		self.output_transactions = []
		self.operations = []
		self.paid_value = 0
		self.address = address
		self.balance_btc = float(self.address.get_address_incoming_transactions_value() / 100000000 or 0)
		self.btc_usd_cost = cache.get("btc_usd")
		if self.btc_usd_cost is None:
			self.btc_usd_cost = Balance.update_btc_usd()
		self.balance_usd = round(self.balance_btc * self.btc_usd_cost, 2)
		self.get_output_transactions()
		self.operations = operations
		for operation in self.operations:
			if operation.status == 0 or operation.status == 2:
				self.paid_value = self.paid_value = + operation.cost_btc
		self.get_paid_operations()

	def check_payment(self, amount_btc):
		return self.get_final_balance_btc - amount_btc

	@classmethod
	def update_btc_usd(cls, symbol="USD"):
		url = f'https://blockchain.info/ticker'
		x = requests.get(url)
		res = x.json()
		value = res[symbol]["last"]
		cache.set("btc_usd", value)
		return value

	@classmethod
	def convert_btc_usd(cls, btc):
		converted_btc = float(btc / 100000000 or 0)
		btc_usd_cost = cache.get("btc_usd")
		if btc_usd_cost is None:
			btc_usd_cost = Balance.update_btc_usd()
		converted_usd = round(converted_btc * btc_usd_cost, 2)
		return converted_btc, converted_usd

	def get_output_transactions(self):
		output_transactions = self.address.get_address_incoming_transactions()
		self.output_transactions = []
		for output_transaction in output_transactions:
			output_transaction["value"], usd = Balance.convert_btc_usd(output_transaction["value"])
			self.output_transactions.append(output_transaction)
		return self.output_transactions

	def get_paid_operations(self):
		return self.operations

	@property
	def get_final_balance_btc(self):
		return float(self.balance_btc) - float(self.paid_value)

	@property
	def get_final_balance_usd(self):
		converted_btc, converted_usd = Balance.convert_btc_usd(self.get_final_balance_btc*100000000)
		return converted_usd



