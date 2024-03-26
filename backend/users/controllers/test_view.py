from django.http import HttpResponse
from django.views import View

class TestClassView(View):
	def __init__(self,request,  *args, **kwargs):
		View.__init__( request, *args, **kwargs)
		pass

	def get(self, request, *args, **kwargs):
		return HttpResponse('test')
