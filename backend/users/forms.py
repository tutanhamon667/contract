from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from django.forms import ModelForm
from django_ckeditor_5.widgets import CKEditor5Widget

from btc.models import JobTier, BuyPaymentPeriod
from contract.settings import CHOICES_WORK_TYPE, CHOICES_WORK_TIMEWORK, CHOICES_WORK_EXPERIENCE, \
    CHOICES_WORK_EXPERIENCE_FILTER, CHOICES_WORK_DEPOSIT_FILTER, CHOICES_WORK_TIME_BUSY_FILTER, \
    CHOICES_WORK_TYPE_FILTER, CHOICES_IS_ACTIVE
from contract.widgets.captcha import CaptchaWidget
from contract.widgets.multiselect import MultiselectWidget
from contract.widgets.password import PasswordWidget
from users.models.common import Region
from users.models.user import Resume, Member, User, Contact, Job, Specialisation, \
    Company, CustomerReview, ResponseInvite, Industry


class JobPaymentTarifForm(forms.Form):
    tier = forms.ModelChoiceField(label="Тариф размещения", queryset=JobTier.objects.all(), blank=True, required=True)
    amount = forms.ModelChoiceField(label="Количество месяцев", queryset=BuyPaymentPeriod.objects.all(), blank=True,
                                    required=True)


class ResumeForm(ModelForm):
    is_offline = forms.ChoiceField(label="Тип занятости", widget=forms.RadioSelect, choices=CHOICES_WORK_TYPE,
                                   initial=1)
    is_fulltime = forms.ChoiceField(label="График работы", widget=forms.RadioSelect, choices=CHOICES_WORK_TIMEWORK,
                                    initial=1)
    work_experience = forms.ChoiceField(label="Опыт работы", widget=forms.RadioSelect, choices=CHOICES_WORK_EXPERIENCE,
                                        initial=1)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'name', 'specialisation', 'salary', 'deposit', 'work_experience', 'is_offline',
                  'region',
                  'is_fulltime', 'description']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if field != 'is_offline' and field != 'is_fulltime' and field != 'active_search' and field != 'work_experience':
                self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})

        self.fields['description'].widget.attrs.update({'class': 'form-control django_ckeditor_5'})


class JobForm(ModelForm):
    class Meta:
        model = Job
        fields = ['id', 'company', 'title', 'specialisation', 'active_search', 'description', 'salary_from',
                  'salary_to',
                  'work_experience', 'deposit', 'is_offline', 'is_fulltime', 'region']
        widgets = {'company': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if field != 'is_offline' and field != 'is_fulltime' and field != 'active_search':
                self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})

        self.fields['description'].widget.attrs.update({'class': 'form-control django_ckeditor_5'})


class ResponseForm(ModelForm):
    class Meta:
        model = ResponseInvite
        fields = ['type', 'job', 'resume', 'status']

        widgets = {
            'job': forms.HiddenInput(),
            'type': forms.HiddenInput(),
            'status': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        user = kwargs["initial"].pop('user', '')
        super().__init__(*args, **kwargs)
        self.fields["resume"] = forms.ModelChoiceField(queryset=Resume.objects.filter(user=user))
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off', 'autofocus': False})


class InviteForm(ModelForm):
    class Meta:
        model = ResponseInvite
        fields = ['type', 'job', 'resume', 'status']

        widgets = {
            'resume': forms.HiddenInput(),
            'type': forms.HiddenInput(),
            'status': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        user = kwargs["initial"].pop('user', '')
        super().__init__(*args, **kwargs)
        self.fields["job"] = forms.ModelChoiceField(queryset=Job.objects.filter(company__user=user))
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off', 'autofocus': False})


class CompanyReviewForm(forms.Form):
    comment = forms.CharField(
        label='Комментарий', max_length=200, required=True
    )
    captcha = forms.CharField(widget=CaptchaWidget(), required=True)
    rating = forms.IntegerField(label='Оценка', max_value=5, initial=5)
    company_id = forms.IntegerField(widget= forms.HiddenInput())
    class Meta:
        fields = ['company_id', 'comment', 'rating', 'reviewer', "captcha", "hashkey"]
        widgets = {'company_id': forms.HiddenInput(),
                   "captcha": CaptchaWidget(), 'hashkey': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(args):
            catcha_widget = CaptchaWidget(args[0]["hashkey"])
        else:
            catcha_widget = CaptchaWidget()

        self.fields["captcha"].widget = catcha_widget

    def clean_captcha(self):
        data = self.cleaned_data['captcha']
        res = self.fields["captcha"].widget.check_capctha(self.cleaned_data["captcha"], self.data["hashkey"])
        if res:
            raise ValidationError(res)
        return data



class WorkerReviewForm(forms.Form):
    comment = forms.CharField(
        label='Комментарий', max_length=200, required=True
    )
    captcha = forms.CharField(widget=CaptchaWidget(), required=True)
    rating = forms.IntegerField(label='Оценка', max_value=5, initial=5)
    resume_id = forms.IntegerField(widget= forms.HiddenInput())
    class Meta:
        fields = ['resume_id', 'comment', 'rating', 'reviewer', "captcha", "hashkey"]
        widgets = {'resume_id': forms.HiddenInput(),
                   "captcha": CaptchaWidget(), 'hashkey': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(args):
            catcha_widget = CaptchaWidget(args[0]["hashkey"])
        else:
            catcha_widget = CaptchaWidget()

        self.fields["captcha"].widget = catcha_widget

    def clean_captcha(self):
        data = self.cleaned_data['captcha']
        res = self.fields["captcha"].widget.check_capctha(self.cleaned_data["captcha"], self.data["hashkey"])
        if res:
            raise ValidationError(res)
        return data


class JobFilterForm(forms.Form):
    title = forms.CharField(
        label='Название вакансии', max_length=200, required=False
    )
    work_type = forms.ChoiceField(label="Тип занятости", widget=forms.RadioSelect, choices=CHOICES_WORK_TYPE_FILTER,
                                  initial="3", required=False)
    region = forms.ModelMultipleChoiceField(label="Регион", queryset=Region.objects.all(), blank=True,
                                            required=False)
    salary_from = forms.IntegerField(
        label='Уровень дохода, ₽', required=False
    )

    specialisation = forms.ModelMultipleChoiceField(label="Специализация", queryset=Specialisation.objects.all(),
                                                    blank=True, required=False)

    work_experience = forms.ChoiceField(label="Опыт работы", widget=forms.RadioSelect,
                                        choices=CHOICES_WORK_EXPERIENCE_FILTER, initial="NoMatter",
                                        required=False)

    work_deposit = forms.ChoiceField(label="Залог", widget=forms.RadioSelect, choices=CHOICES_WORK_DEPOSIT_FILTER,
                                     initial='0',
                                     required=False)
    deposit = forms.IntegerField(
        label='Сумма залога, ₽', required=False
    )
    work_time_busy = forms.ChoiceField(label="График работы", widget=forms.RadioSelect,
                                       choices=CHOICES_WORK_TIME_BUSY_FILTER, initial='3',
                                       required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if field != 'work_time_busy' and field != 'work_experience' and field != 'work_type' and field != 'work_deposit' and field != 'region':
                self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})
            else:
                self.fields[field].widget.attrs.update({'class': 'form-radio-input', 'autocomplete': 'off'})
            if field == 'region':
                self.fields[field].widget.attrs.update({'class': 'subform-field', 'autocomplete': 'off'})

        if "region" in kwargs["initial"]:
            multiselect_region_widget = MultiselectWidget(label='Регион', items=Region.objects.all(),
                                                          selected=kwargs["initial"]["region"])
        else:
            multiselect_region_widget = MultiselectWidget(label='Регион', items=Region.objects.all())
        if "title" in kwargs["initial"]:
            self.fields["title"].initial = kwargs["initial"]["title"]
        if "specialisation" in kwargs["initial"]:
            multiselect_specialisation_widget = MultiselectWidget(label='Специализация', items=Industry.objects.all(),
                                                                  selected=kwargs["initial"]["specialisation"])
        else:
            multiselect_specialisation_widget = MultiselectWidget(label='Специализация', items=Industry.objects.all())

        self.fields["specialisation"].widget = multiselect_specialisation_widget
        self.fields["region"].widget = multiselect_region_widget


class ResumeFilterForm(forms.Form):
    title = forms.CharField(
        label='Название вакансии', max_length=200, required=False
    )
    work_type = forms.ChoiceField(label="Тип занятости", widget=forms.RadioSelect, choices=CHOICES_WORK_TYPE_FILTER,
                                  initial="3", required=False)
    region = forms.ModelMultipleChoiceField(label="Регион", queryset=Region.objects.all(), blank=True,
                                            required=False)
    salary_to = forms.IntegerField(
        label='Уровень дохода, ₽', required=False
    )

    specialisation = forms.ModelMultipleChoiceField(label="Специализация", queryset=Specialisation.objects.all(),
                                                    blank=True, required=False)

    work_experience = forms.ChoiceField(label="Опыт работы", widget=forms.RadioSelect,
                                        choices=CHOICES_WORK_EXPERIENCE_FILTER, initial="NoMatter",
                                        required=False)

    work_deposit = forms.ChoiceField(label="Залог", widget=forms.RadioSelect, choices=CHOICES_WORK_DEPOSIT_FILTER,
                                     initial='0',
                                     required=False)
    deposit = forms.IntegerField(
        label='Сумма залога, ₽', required=False
    )
    work_time_busy = forms.ChoiceField(label="График работы", widget=forms.RadioSelect,
                                       choices=CHOICES_WORK_TIME_BUSY_FILTER, initial='3',
                                       required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            if field != 'work_time_busy' and field != 'work_experience' and field != 'work_type' and field != 'work_deposit' and field != 'region':
                self.fields[field].widget.attrs.update({'class': 'form-control', 'autocomplete': 'off'})
            else:
                self.fields[field].widget.attrs.update({'class': 'form-radio-input', 'autocomplete': 'off'})
            if field == 'region':
                self.fields[field].widget.attrs.update({'class': 'subform-field', 'autocomplete': 'off'})

        if "region" in kwargs["initial"]:
            multiselect_region_widget = MultiselectWidget(label='Регион', items=Region.objects.all(),
                                                          selected=kwargs["initial"]["region"])
        else:
            multiselect_region_widget = MultiselectWidget(label='Регион', items=Region.objects.all())
        if "title" in kwargs["initial"]:
            self.fields["title"].initial = kwargs["initial"]["title"]
        if "specialisation" in kwargs["initial"]:
            multiselect_specialisation_widget = MultiselectWidget(label='Специализация', items=Industry.objects.all(),
                                                                  selected=kwargs["initial"]["specialisation"])
        else:
            multiselect_specialisation_widget = MultiselectWidget(label='Специализация', items=Industry.objects.all())

        self.fields["specialisation"].widget = multiselect_specialisation_widget
        self.fields["region"].widget = multiselect_region_widget


class ProfileForm(ModelForm):
    is_active = forms.ChoiceField(label="Статус поиска", widget=forms.RadioSelect, choices=CHOICES_IS_ACTIVE,
                      initial=1)
    class Meta:
        model = Member
        fields = ['id', 'photo', 'is_active']


class PasswordChangeForm(forms.Form):

    new_password = forms.CharField(widget=PasswordWidget('Старый пароль'), required=True)
    password1 = forms.CharField(widget=PasswordWidget('Новый пароль'), required=True)
    password2 = forms.CharField(widget=PasswordWidget('Повторите новый пароль'), required=True)

    class Meta:
        fields = [ "new_password", "password1", "password2" ]
        widgets = {'password1': PasswordWidget(), 'password2': PasswordWidget(),
                   "new_password": PasswordWidget()}

    def clean_password2(self):
        data = self.cleaned_data['password2']
        res = self.fields["password2"].widget.validate(self.cleaned_data["password1"], self.cleaned_data["password2"])
        if res:
            raise ValidationError(res)
        return data




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


class ContactForm(ModelForm):
    class Meta:
        model = Contact
        fields = ['id', 'user', 'type', 'value', 'preferred']
        widgets = {'user': forms.HiddenInput()}


class CaptchaForm(forms.Form):
    captcha = forms.CharField(widget=None, required=True)

    class Meta:
        fields = ["captcha", "hashkey"]
        widgets = {"captcha": CaptchaWidget(), 'hashkey': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(args):
            catcha_widget = CaptchaWidget(args[0]["hashkey"])
        else:
            catcha_widget = CaptchaWidget()

        self.fields["captcha"].widget = catcha_widget

    def clean_captcha(self):
        data = self.cleaned_data['captcha']
        res = self.fields["captcha"].widget.check_capctha(self.cleaned_data["captcha"], self.data["hashkey"])
        if res:
            raise ValidationError(res)
        return data


class LoginForm(forms.Form):
    login = forms.CharField(label="Логин", required=True)
    password = forms.CharField(widget=PasswordWidget(), required=True)
    captcha = forms.CharField(widget=CaptchaWidget(), required=True)

    class Meta:
        fields = ['login', "captcha", "password", "hashkey"]
        widgets = {'password': PasswordWidget(), "captcha": CaptchaWidget(), 'hashkey': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(args):
            catcha_widget = CaptchaWidget(args[0]["hashkey"])
        else:
            catcha_widget = CaptchaWidget()

        self.fields["captcha"].widget = catcha_widget

    def clean_captcha(self):
        data = self.cleaned_data['captcha']
        res = self.fields["captcha"].widget.check_capctha(self.cleaned_data["captcha"], self.data["hashkey"])
        if res:
            raise ValidationError(res)
        return data


class RegisterCustomerForm(UserCreationForm):
    company_name = forms.CharField(max_length=255, label="Название компании")
    password1 = forms.CharField(widget=PasswordWidget(), required=True)
    password2 = forms.CharField(widget=PasswordWidget('Повторите пароль'), required=True)
    captcha = forms.CharField(widget=CaptchaWidget(), required=True)

    class Meta:
        model = Member
        fields = ['company_name', 'login', 'display_name', "captcha", "password1", "password2", "is_customer",
                  ]
        widgets = {"is_customer": forms.HiddenInput(), 'password1': PasswordWidget(), 'password2': PasswordWidget(),
                   "captcha": CaptchaWidget(), 'hashkey': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(args):
            catcha_widget = CaptchaWidget(args[0]["hashkey"])
        else:
            catcha_widget = CaptchaWidget()

        self.fields["captcha"].widget = catcha_widget

    def clean_captcha(self):
        data = self.cleaned_data['captcha']
        res = self.fields["captcha"].widget.check_capctha(self.cleaned_data["captcha"], self.data["hashkey"])
        if res:
            raise ValidationError(res)
        return data

    def clean_password2(self):
        data = self.cleaned_data['password2']
        res = self.fields["password2"].widget.validate(self.cleaned_data["password1"], self.cleaned_data["password2"])
        if res:
            raise ValidationError(res)
        return data

    def clean_login(self):
        data = self.cleaned_data['login']
        user = Member.objects.filter(login=self.cleaned_data["login"])
        if len(user):
            raise ValidationError(
                'Логин %(value)s занят',
                params={'value': self.cleaned_data["login"]}
            )
        return data

    def clean_display_name(self):
        data = self.cleaned_data['display_name']
        display_name = Member.objects.filter(display_name=self.cleaned_data["display_name"])
        if len(display_name):
            raise ValidationError(
                'Отображаемое имя %(value)s занято',
                params={'value': self.cleaned_data["display_name"]}
            )
        return data

    def clean_company_name(self):
        data = self.cleaned_data['company_name']
        company = Company.objects.filter(name=self.cleaned_data["company_name"])
        if len(company):
            raise ValidationError(
                'Имя компании %(value)s занято',
                params={'value': self.cleaned_data["company_name"]}
            )
        return data

    def save(self, commit=True):
        user = super(RegisterCustomerForm, self).save(commit=False)
        if commit:
            user.save()
        return user


class RegisterWorkerForm(UserCreationForm):
    password1 = forms.CharField(widget=PasswordWidget(), required=True)
    password2 = forms.CharField(widget=PasswordWidget('Повторите пароль'), required=True)
    captcha = forms.CharField(widget=CaptchaWidget(), required=True)

    class Meta:
        model = Member
        fields = ['login', 'display_name', "password1", "password2", "captcha", "is_customer"]
        widgets = {"is_customer": forms.HiddenInput(), 'password1': PasswordWidget(), 'password2': PasswordWidget(),
                   "captcha": CaptchaWidget()}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(args):
            catcha_widget = CaptchaWidget(args[0]["hashkey"])
        else:
            catcha_widget = CaptchaWidget()

        self.fields["captcha"].widget = catcha_widget

    def clean_captcha(self):
        data = self.cleaned_data['captcha']
        res = self.fields["captcha"].widget.check_capctha(self.cleaned_data["captcha"], self.data["hashkey"])
        if res:
            raise ValidationError(res)
        return data

    def clean_password2(self):
        data = self.cleaned_data['password2']
        res = self.fields["password2"].widget.validate(self.cleaned_data["password1"], self.cleaned_data["password2"])
        if res:
            raise ValidationError(res)
        return data

    def clean_login(self):
        data = self.cleaned_data['login']
        user = Member.objects.filter(login=self.cleaned_data["login"])
        if len(user):
            raise ValidationError(
                'Логин %(value)s занят',
                params={'value': self.cleaned_data["login"]}
            )
        return data

    def clean_display_name(self):
        data = self.cleaned_data['display_name']
        display_name = Member.objects.filter(display_name=self.cleaned_data["display_name"])
        if len(display_name):
            raise ValidationError(
                'Отображаемое имя %(value)s занято',
                params={'value': self.cleaned_data["display_name"]}
            )
        return data

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
