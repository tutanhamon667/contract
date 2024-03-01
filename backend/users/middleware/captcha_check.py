from django.shortcuts import redirect


def captcha_check(get_response):
    # One-time configuration and initialization.

    def middleware(request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        response = get_response(request)
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

        return response

    return middleware