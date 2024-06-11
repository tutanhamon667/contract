# chat/views.py
import datetime
import os

from django.http import JsonResponse
from django.shortcuts import render, redirect

from chat.models import FileMessage, Chat, Message
from contract.settings import CHAT_MESSAGE_TYPE


import os
from django.conf import settings
from django.http import HttpResponse, Http404

def download(request, file_id):
    user = request.user
    if user.is_authenticated:
        message = Message.objects.get(file_id=file_id)
        chat = Chat.objects.get(pkid=message.chat_id)
        file = FileMessage.objects.get(id=file_id)
        if chat.customer == user or chat.worker == user or chat.moderator == user:
            file_path = os.path.join(settings.MEDIA_ROOT, f'chat/{chat.uuid}/{file.name}')
            if os.path.exists(file_path):
                with open(file_path, 'rb') as fh:
                    response = HttpResponse(fh.read(), content_type="application/vnd.ms-excel")
                    response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
                    return response
            raise Http404
        else:
            raise Http404

def index(request):
    if not request.user.is_authenticated:
        return redirect('signin')
    serialized_chat = {"user_id": request.user.id, "chat_id": 'null'}
    return render(request, "pages/chat.html", {"chat_id": 'null', "serialized_chat": serialized_chat})

def index_chat(request, chat_id):
    if not request.user.is_authenticated:
        return redirect('signin')
    serialized_chat = {"user_id": request.user.id, "chat_id": chat_id}
    return render(request, "pages/chat.html", {"chat_id": chat_id, "serialized_chat": serialized_chat})


def upload(request, chat_id):
    if request.method == 'POST':
        if request.user.is_authenticated:
            file = request.FILES['file'].read()
            fileName =  str(datetime.datetime.now()) + request.POST['filename']
            end = request.POST['end']
            nextSlice = request.POST['nextSlice']

            if file == "" or fileName == "" or end == "" or nextSlice == "":
                res = JsonResponse({'data': 'Invalid Request'})
                return res
            else:
                path = f'media/chat/{chat_id}/'
                if not os.path.exists(path):
                    os.makedirs(path)
                with open(path + fileName, 'wb+') as destination:
                    destination.write(file)
                FileFolder = FileMessage(uploader=request.user)
                FileFolder.existingPath = path + fileName
                FileFolder.eof = end
                FileFolder.name = fileName
                FileFolder.save()
                if int(end):
                    res = JsonResponse({'data': 'Uploaded Successfully', 'existingPath': fileName, 'id': FileFolder.id})
                else:
                    res = JsonResponse({'existingPath': fileName})
                return res

