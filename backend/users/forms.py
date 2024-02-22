from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth.forms import UserCreationForm
from django.forms import ModelForm
from django_ckeditor_5.widgets import CKEditor5Widget

from users.models.common import Region
from users.models.user import Resume, Member, User, Contact, Job, Specialisation, \
	Company, CustomerReview


class JobForm(ModelForm):
	class Meta:
		model = Job
		fields = ['id', 'company', 'title', 'specialisation', 'description', 'salary', 'salary_from', 'salary_to',
				  'work_experience', 'deposit', 'is_offline', 'is_fulltime', 'region']
		widgets = {'company': forms.HiddenInput()}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		for field in self.fields:
			if field != 'is_offline' and field != 'is_fulltime':
				self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})

		self.fields['description'].widget.attrs.update({'class': 'form-control django_ckeditor_5'})


class JobFilterForm(ModelForm):
	work_type_no_matter = forms.BooleanField(label="Не имеет значения")
	work_time_no_matter = forms.BooleanField(label="Не имеет значения")
	region = forms.ModelMultipleChoiceField(label="Регион рабоы", queryset=Region.objects.all())
	specialisation = forms.ModelMultipleChoiceField(label="Специализация", queryset=Specialisation.objects.all())
	class Meta:
		model = Job
		fields = ['id', 'title', 'specialisation', 'is_offline', 'work_type_no_matter', 'salary', 'salary_from', 'deposit', 'is_fulltime', 'work_time_no_matter']
		exclude = ['salary', 'work_experience', 'description', 'company', 'salary_to', 'region', 'specialisation']

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		checkboxes = ['is_offline', 'is_fulltime', 'work_type_no_matter', 'work_time_no_matter']
		for field in self.fields:
			if field not in checkboxes:
				self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})


class ProfileForm(ModelForm):
	class Meta:
		model = Member
		fields = ['id', 'photo', 'login', 'display_name', 'first_name', 'last_name', 'photo']




class CompanyForm(ModelForm):
	class Meta:
		model = Company
		fields = ['id', 'user', 'logo', 'email', 'name', 'about', 'web']
		widgets = {'user': forms.HiddenInput()}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		for field in self.fields:
			self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})

		self.fields['about'].widget.attrs.update({'class': 'form-control django_ckeditor_5'})


class CustomerReviewForm(ModelForm):
	class Meta:
		model = CustomerReview
		fields = ['id', 'company', 'reviewer', 'comment', 'rating']
		widgets = {'reviewer': forms.HiddenInput(), 'company': forms.HiddenInput(), 'id': forms.HiddenInput()}


class ResumeForm(ModelForm):
	class Meta:
		model = Resume
		fields = ['id', 'user', 'name', 'specialisation', 'salary', 'deposit', 'work_experience', 'is_offline',
				  'is_fulltime', 'region']
		widgets = {'user': forms.HiddenInput()}


class ContactForm(ModelForm):
	class Meta:
		model = Contact
		fields = ['id', 'user', 'type', 'value', 'preferred']
		widgets = {'user': forms.HiddenInput()}


class RegisterCustomerForm(UserCreationForm):
	company_name = forms.CharField(max_length=255)

	class Meta:
		model = Member
		fields = ['login', 'display_name', "password1", "password2", "is_customer"]
		widgets = {"is_customer": forms.HiddenInput()}


def save(self, commit=True):
	user = super(RegisterCustomerForm, self).save(commit=False)
	if commit:
		user.save()
	return user


class RegisterWorkerForm(UserCreationForm):
	class Meta:
		model = Member
		fields = ['login', 'display_name', "password1", "password2", "is_worker"]
		widgets = {"is_worker": forms.HiddenInput()}


def save(self, commit=True):
	user = super(RegisterWorkerForm, self).save(commit=False)
	if commit:
		user.save()
	return user


class ResumeDeleteForm(ModelForm):
	class Meta:
		model = Resume
		fields = ['id']
		widgets = {'id': forms.HiddenInput()}
