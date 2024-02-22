from django import forms

from common.models import Article
from django.forms import ModelForm


class ArticleForm(ModelForm):
	class Meta:
		model = Article
		fields = ['id', 'user', 'category', 'text', 'link']
		widgets = {'user': forms.HiddenInput()}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		for field in self.fields:
			self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})

		self.fields['text'].widget.attrs.update({'class': 'form-control django_ckeditor_5'})