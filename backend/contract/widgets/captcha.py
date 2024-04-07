from django import forms
from django.template import loader
from django.utils.safestring import mark_safe

from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from users.models.common import Captcha


class CaptchaWidget(forms.Widget):
	template_name = "../templates/widgets/captcha.html"
	is_required = True

	def	check_capctha(self, value, hash):
		self.error = None
		if value is None:
			self.error =  "Обязательное поле"
			return self.error
		res = Captcha.check_chaptcha(captcha=value, hash=hash)
		if not res:
			self.error =  "Каптча введена не верно."
		return self.error


	def __init__(self, hash=None):
		super().__init__()
		captcha = Captcha()
		if hash:
			key = captcha.get_captcha_challenge(hash)
			if key:
				image = SimpleCaptcha(width=280, height=120)
				captcha_base64 = image.get_base64(key)
				self.image = captcha_base64
				self.hash = hash
			else:
				key, hash_key = captcha.generate_key()
				image = SimpleCaptcha(width=280, height=120)
				captcha_base64 = image.get_base64(key)
				self.image = captcha_base64
				self.hash = hash
		else:
			key, hash_key = captcha.generate_key()
			image = SimpleCaptcha(width=280, height=120)
			captcha_base64 = image.get_base64(key)
			self.hash = hash_key
			self.image = captcha_base64

		self.error = None


	def get_context(self, name, value, attrs=None):

		return {'widget': {
			'name': name,
			'value': value or '',
			'hash': self.hash,
			'image': self.image,
			'error': self.error
		}}

	def render(self, name, value, attrs=None, renderer=None):
		"""Render the widget as an HTML string."""

		self.error = None
		context = self.get_context(name, value, attrs)
		return self._render(self.template_name, context, renderer)