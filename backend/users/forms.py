from ckeditor.widgets import CKEditorWidget
from django import forms
from captcha.fields import CaptchaField
from django.contrib.auth.forms import UserCreationForm
from django.forms import ModelForm

from users.models.user import Resume, Member, User, Contact, Job, WorkerProfile, CustomerProfile


class Captcha(forms.Form):
    captcha = CaptchaField()


class JobForm(ModelForm):
    class Meta:
        model = Job
        fields = ['id', 'customer', 'title', 'specialisation', 'description', 'salary', 'salary_from', 'salary_to', 'work_experience', 'deposit', 'is_offline', 'is_fulltime', 'region']
        widgets = {'customer': forms.HiddenInput(), 'description': CKEditorWidget}

class WorkerForm(ModelForm):
    class Meta:
        model = WorkerProfile
        fields = ['id', 'user', 'photo']
        widgets = {'user': forms.HiddenInput()}

class CustomerForm(ModelForm):
    class Meta:
        model = CustomerProfile
        fields = ['id', 'user', 'photo', 'email', 'company_name', 'about', 'web']
        widgets = {'user': forms.HiddenInput()}


class ResumeForm(ModelForm):
    class Meta:
        model = Resume
        fields = ['id', 'user', 'name', 'specialisation', 'salary', 'deposit', 'work_experience', 'is_offline', 'is_fulltime', 'region']
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
        fields = ['login', 'display_name',"password1", "password2", "is_customer", "company_name"]
        widgets = {"is_customer": forms.HiddenInput()}


    def save(self, commit=True):
        user = super(RegisterCustomerForm, self).save(commit=False)
        if commit:
            user.save()
        return user


class RegisterWorkerForm(UserCreationForm):
    class Meta:
        model = Member
        fields = ['login', 'display_name',"password1", "password2", "is_worker"]
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
        widgets = { 'id': forms.HiddenInput()}

