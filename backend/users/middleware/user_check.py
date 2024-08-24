from django.http import HttpResponse
from django.shortcuts import redirect


from contract import settings
from users.core.access import Access


def user_check(get_response):
    # One-time configuration and initialization.

    def middleware(request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

       
        if request.method == 'GET':
            # simple parse url  like '/entity/action/id'
            # return (entity, action, id)

            # simple parse url  like '/entity/id'
            # return (entity, id)

            # simple parse url  like '/entity'
            # return (entity, )

            # complex parse url  like '/entity/id/action'
            # return (entity, id, action)


          
            entity = request.path
            access = Access(request.user)
            code = access.user_access(entity)
            print(code)
            if code != 200:
                if code == 401:
                    return redirect('signin')
                if code == 666:
                    return redirect('activate_view')
                else:
                    return HttpResponse(status=code)
                    
          
   
        return get_response(request)

    return middleware