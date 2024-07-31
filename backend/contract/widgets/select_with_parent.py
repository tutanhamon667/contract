from django import forms
from django.template import loader
from django.utils.safestring import mark_safe
import collections.abc

class SelectParentWidget(forms.Widget):
	template_name = "../templates/widgets/select_parent.html"

	def __init__(self, label = None, items = None, selected=None):
		super().__init__()
		self.label = label
		self.items = items
		self.selected = selected

	def build_attrs(self, base_attrs, extra_attrs=None):
		"""Build an attribute dictionary."""
		return {**base_attrs, **(extra_attrs or {})}


	def render(self, name, value, attrs=None, renderer=None):
		"""Render the widget as an HTML string."""
		context = self.get_context(name, value, attrs)
		return self._render(self.template_name, context, renderer)

	def get_context(self, name, value, attrs=None):
		items = list(self.items.values())
		if self.selected:
			for item in items:
				if int(self.selected) == item["id"]:
					item["selected"] = True
		else:
			items.insert(0, {"id": '', "name": "Не выбрано", "selected": True})
		return {'widget': {
		'name': name,
		'value': value,
		'label': self.label,
		'items': items,
		'selected': self.selected
		}}
