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


class CompanyReviewForm(ModelForm):
	class Meta:
		model = CustomerReview
		fields = ['company', 'comment', 'rating', 'reviewer']
		widgets = {'company': forms.HiddenInput(), 'rating': forms.HiddenInput(), 'reviewer': forms.HiddenInput()}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		for field in self.fields:
			if field == 'rating':
				self.fields[field].widget.attrs.update({'class': 'form-control rating-value', 'autocomplete': 'off'})
			else:
				self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off', 'autofocus': False})

class JobFilterForm(forms.Form):

	region = forms.ModelMultipleChoiceField(label="Регион рабоы", queryset=Region.objects.all(), blank=True, required=False)
	specialisation = forms.ModelMultipleChoiceField(label="Специализация", queryset=Specialisation.objects.all(), blank=True, required=False)
	title = forms.CharField(
		label='Название вакансии', max_length=200, required=False
	)
	CHOICES_WORK_TYPE = [("1", "Оффлайн"),("2", "Онлайн"),("3", "Не имеет значения")]
	CHOICES_WORK_EXPERIENCE = [("WithoutExperience", "Нет опыта"),
							   ("Between1And6", "От 1 до 6 месяцев"),
							   ("Between6And12", "От 6 месяцев до 1 года"),
	("NoMatter", "Не имеет значения")]
	CHOICES_WORK_TIME_BUSY = [("1", "Полный график"), ("2", "Гибкий график"), ('3', 'Не имеет значения')]
	CHOICES_WORK_DEPOSIT = [("1", "С залогом"), ("2", "Без залога")]
	salary_from = forms.IntegerField(
		label='Зарплата от', required=False
	)
	work_deposit = forms.ChoiceField(widget=forms.RadioSelect, choices=CHOICES_WORK_DEPOSIT, initial='2', required=False)
	deposit = forms.IntegerField(
		label='Депозит до', required=False
	)
	work_time_busy = forms.ChoiceField(widget=forms.RadioSelect, choices=CHOICES_WORK_TIME_BUSY, initial='3', required=False)
	work_experience = forms.ChoiceField(widget=forms.RadioSelect, choices=CHOICES_WORK_EXPERIENCE, initial="NoMatter", required=False)
	work_type = forms.ChoiceField(widget=forms.RadioSelect, choices=CHOICES_WORK_TYPE, initial="3", required=False)

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		if "specialisation" in kwargs["initial"]:
			self.fields["specialisation"].initial = kwargs["initial"].getlist("specialisation")
		if "region" in kwargs["initial"]:
			self.fields["region"].initial = kwargs["initial"].getlist("region")


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
