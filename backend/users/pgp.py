from venv import logger
from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseServerError
import gnupg
import random
import string
from django.contrib.auth.decorators import permission_required
from users.forms import PGPForm, TwoFactorAuthenticationForm
from users.models.user import Member, PGPKey


@permission_required('app_name.change_article')
def pgp_challenge(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('customer_signin')
    pgp_key = PGPKey.objects.get(user=request.user)
    # Generate random message
    message = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
    # Encrypt message
    gpg = gnupg.GPG()
    encrypted_message = gpg.encrypt(message, pgp_key.key)
    request.session['pgp_challenge'] = message
    form = TwoFactorAuthenticationForm(initial={'decrypted_message': ''}, encrypted_message=encrypted_message)
    return render(request, 'pgp_challenge.html', {'form': form})



def pgp_create(request):    
    try:
        if request.user.is_authenticated:
            user = request.user
            if request.method == 'POST':
                pgp = PGPKey.objects.get(user=user)
                if pgp.key is not None:
                    return HttpResponse('Method not allowed', status=405)                
                form = PGPForm(request.POST, instance=pgp)
                if form.is_valid():
                    form.save()
                    text_message = PGPKey.generate_and_sign_validation_text(form.cleaned_data['key'], user)
                    pgp = PGPKey.objects.get(user=user)
                    form = PGPForm(instance=pgp)
                return render(request, './blocks/profile/profile_main.html', {
                    'form': form,
                    'verify_pgp': True,
                })

    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")

def pgp_verify(request):
    try:
        if request.user.is_authenticated:
            user = request.user
            if request.method == 'POST':
                pgp = PGPKey.objects.get(user=user)
                if pgp.key is not None:
                    return HttpResponse('Method not allowed', status=405)                
                form = PGPForm(request.POST, instance=pgp)
                if form.is_valid():
                    form.save()
                    res = PGPKey.verify(user, form.cleaned_data['auth_key'])
                    error_message = None
                    if res is False:
                        error_message = 'Invalid key'
                    return render(request, './blocks/profile/profile_main.html', {
                        'form': form,
                        'verify_pgp': True,
                        'error_message': error_message
                    })
            else:
               return HttpResponse('Invalid decrypted message', status=400)
        return HttpResponse('Method not allowed', status=405)
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        return HttpResponseServerError("An unexpected error occurred. Please try again later.")
   