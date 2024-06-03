from django import forms
from django.template import loader
from django.utils.safestring import mark_safe
import collections.abc

class MultiselectWidget(forms.Widget):
	template_name = "../templates/widgets/multiselect.html"

	def __init__(self, label = None, items = None, selected=None):
		super().__init__()
		self.label = label
		self.items = items
		self.selected = selected

	def validate(self, value, value2=None):
		self.error = None
		if value is None:
			self.error = "Обязательное поле"
			return self.error

		if value2 and value2 != value:
			self.error = "Пароли не совпадают"
		return self.error

	def build_attrs(self, base_attrs, extra_attrs=None):
		"""Build an attribute dictionary."""
		return {**base_attrs, **(extra_attrs or {})}

	def get_context(self, name, value, attrs=None):
		items = list(self.items.values())
		if self.selected:
			for item in items:
				if isinstance(self.selected, int) is True:
					if int(self.selected) == item["id"]:
						item["selected"] = True
				else:
					for selected in self.selected:
						if int(selected) == item["id"]:
							item["selected"] = True
		return {'widget': {
			'name': name,
			'value': value,
			'label': self.label,
			'items': items,
			'selected': self.selected
		}}

	def render(self, name, value, attrs=None, renderer=None):
		"""Render the widget as an HTML string."""
		context = self.get_context(name, value, attrs)
		return self._render(self.template_name, context, renderer)
