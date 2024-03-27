import qrcode
from django.core.files.storage import default_storage
from django.http import HttpResponse
from django.views import View

def test(request):
	img = qrcode.make('uig1ui21iug131i3l3')
	default_storage.save('./qrcode_addresses/uig1ui21iug131i3l3.jpg', img)
