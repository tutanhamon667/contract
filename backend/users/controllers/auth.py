import base64

from django.shortcuts import render, redirect

from contract.libs.captcha.SimpleCapcha import SimpleCaptcha
from users.forms import RegisterWorkerForm, RegisterCustomerForm
from users.models.common import Captcha
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, authenticate
from users.models.user import CustomerProfile, WorkerProfile
from django.contrib.auth.forms import AuthenticationForm
from btc.libs.btc_wallet import get_wallet, generate_address, get_addresses_count
from btc.models import Address as WalletAddress


def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
    return redirect(to="index")

def login_view(request):
    if request.method == "GET":
        form = AuthenticationForm()
        captcha = Captcha()
        key, hash_key = captcha.generate_key()
        image = SimpleCaptcha(width=280, height=90)
        captcha_base64 = image.get_base64(key)
        return render(request, 'login.html', {'form': form, 'hashkey': hash_key, 'captcha': captcha_base64})
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)

        hash_key = request.POST.get("hashkey")
        res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
        if not res:
            messages.error(request, "Unsuccessful login.Captcha Invalid .")
            return render(request, 'login.html',
                          {'form': form,
                           'hashkey': hash_key,
                           'captcha': SimpleCaptcha.captcha_check(request)})

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.info(request, f"You are now logged in as {username}.")
                return redirect("index")
            else:
                messages.error(request, "Invalid username or password.")
                return render(request, 'login.html',
                              {'form': form,
                               'hashkey': hash_key,
                               'captcha': SimpleCaptcha.captcha_check(request)})
        else:
            messages.error(request, "Invalid username or password.")
            return render(request, 'login.html',
                          {'form': form,
                           'hashkey': hash_key,
                           'captcha': SimpleCaptcha.captcha_check(request)})


def registration_customer_view(request):
    if request.method == "GET":
        form = RegisterCustomerForm(initial={"is_customer": True})
        captcha = Captcha()
        key, hash_key = captcha.generate_key()
        image = SimpleCaptcha(width=280, height=90)
        captcha_base64 = image.get_base64(key)
        return render(request, 'register.html', {'form': form, 'hashkey': hash_key, 'captcha': captcha_base64})
    if request.method == "POST":
        form = RegisterCustomerForm(request.POST)

        hash_key = request.POST.get("hashkey")
        res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
        if not res:
            messages.error(request, "Unsuccessful registration.Captcha Invalid .")
            return render(request, 'register.html',
                          {'form': form,
                           'hashkey': hash_key,
                           'captcha': SimpleCaptcha.captcha_check(request)})
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Registration successful.")
            company_name = request.POST.get('company_name') or None
            customer_profile = CustomerProfile(user=user, company_name=company_name)
            customer_profile.save()
            wallet = get_wallet()
            addresses_count = get_addresses_count(wallet)
            address = generate_address(addresses_count + 1, wallet.seed)
            new_address = WalletAddress(address=address["address"], wif=address["wif"], wallet=wallet, user=user)
            return redirect(to='index')
        else:
            messages.error(request, "Unsuccessful registration. Invalid information.")
        return render(request, 'register.html',
                      {'form': form,
                       'hashkey': request.POST['hashkey'],
                       'captcha': SimpleCaptcha.captcha_check(request)})


def registration_worker_view(request):
    if request.method == "GET":
        form = RegisterWorkerForm(initial={"is_worker": True})
        captcha = Captcha()
        key, hash_key = captcha.generate_key()
        image = SimpleCaptcha(width=280, height=90)
        captcha_base64 = image.get_base64(key)
        return render(request, 'register.html', {'form': form, 'hashkey': hash_key, 'captcha': captcha_base64})
    if request.method == "POST":
        form = RegisterWorkerForm(request.POST)

        hash_key = request.POST.get("hashkey")
        res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
        if not res:
            messages.error(request, "Unsuccessful registration.Captcha Invalid .")
            return render(request, 'register.html',
                          {'form': form,
                           'hashkey': hash_key,
                           'captcha': SimpleCaptcha.captcha_check(request)})
        if form.is_valid():
            user = form.save()
            user.is_moderated = True
            user.save()
            login(request, user)
            messages.success(request, "Registration successful.")
            worker_profile = WorkerProfile(user=user)
            worker_profile.save()
            return redirect(to='index')

        else:
            messages.error(request, "Unsuccessful registration. Invalid information.")
        return render(request, 'register.html',
                      {'form': form,
                       'hashkey': request.POST['hashkey'],
                       'captcha': SimpleCaptcha.captcha_check(request)})
