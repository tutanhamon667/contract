from django.conf import settings
from django.http import HttpResponseServerError
from django.shortcuts import redirect


def captcha_check(get_response):
    # One-time configuration and initialization.

    def middleware(request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        try:
            response = get_response(request)
            
            user = request.user
         

            # check if the user has a verified OTP device that matches one of the allowed devices
            if request.user.is_authenticated and hasattr(request.user, 'pgpkey'):
                if 'pgp_verified' not in request.session:
                    request.session['user_id'] = request.user.id
                    return redirect('pgp_challenge')
            if request.method == 'GET':

                cookies = request.COOKIES
                path = request.path
                query_str = request.GET.urlencode()
                if 'captcha' not in cookies and request.path != '/captcha':
                    redirect_after_captcha = None
                    if path != '/captcha':
                        redirect_after_captcha = f'{path}?{query_str}'
                    request.session['redirect'] = redirect_after_captcha
                    response = redirect(to="captcha")
                # Code to be executed for each request/response after
                # the view is called.
            if request.path == '/favicon.ico':
                response = redirect(to="index")
            return response
        except Exception as e:
            print(e)
            return HttpResponseServerError("An unexpected error occurred. Please try again later.")
    return middleware