from django import forms
from django.template import loader
from django.utils.safestring import mark_safe


class PasswordWidget(forms.Widget):
	template_name = "../templates/widgets/password.html"

	def __init__(self, label = None):
		super().__init__()
		self.label = label or 'Пароль'

	def validate(self, value, value2=None):
		self.error = None
		if value is None:
			self.error = "Обязательное поле"
			return self.error

		if value2 and value2 != value:
			self.error = "Пароли не совпадают"
		return self.error

	def get_context(self, name, value, attrs=None):

		return {'widget': {
			'name': name,
			'value': value,
			'label': self.label
		}}

	def render(self, name, value, attrs=None, renderer=None):
		"""Render the widget as an HTML string."""
		context = self.get_context(name, value, attrs)
		return self._render(self.template_name, context, renderer)
