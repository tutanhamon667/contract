import json
from datetime import datetime
from typing import Any
from uuid import UUID
from channels.generic.websocket import WebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder
from asgiref.sync import async_to_sync
from chat.models import Chat, Message


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            # if the obj is uuid, we simply return the value of uuid
            return obj.hex
        return json.JSONEncoder.default(self, obj)

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        print(self.scope["user"])
        user = self.scope["user"]
        if not user.id:
            self.disconnect(403)
        else:

            async_to_sync(self.channel_layer.group_add)(
                "main", self.channel_name
            )

            response = []
            chats = Chat.get_user_chats(user)
            for chat in chats:
                async_to_sync(self.channel_layer.group_add)(
                   str(chat.uuid), self.channel_name
                )
                messages = Message.objects.filter(chat=chat).order_by('-id')[:1]
                #not_read_messages = Message.objects.filter(chat=chat, sender__us)
                if len(messages):
                    last_message = [{"message": messages[0].content, "sender": messages[0].sender.display_name, "chat_uuid": str(messages[0].chat.uuid), "date": str(messages[0].created)}]
                else:
                    last_message = []
                item = {"self_user":None, "other_user": None, "chat_uuid":  str(chat.uuid), "messages": last_message}
                other_user = None
                self_user = None
                if chat.worker and user.is_worker:
                    self_user = chat.worker
                    if chat.customer:
                        other_user = chat.customer
                    if chat.moderator:
                        other_user = chat.moderator
                if chat.customer and user.is_customer:
                    self_user = chat.customer
                    if chat.worker:
                        other_user = chat.worker
                    if chat.moderator:
                        other_user = chat.moderator
                if chat.moderator and user.is_moderator:
                    self_user = chat.moderator
                    if chat.worker:
                        other_user = chat.worker
                    if chat.modecustomer:
                        other_user = chat.customer
                item["other_user"] = {
                    'photo': other_user.photo.url,
                    'display_name': other_user.display_name
                }
                item["self_user"] = {
                    'photo': self_user.photo.url,
                    'display_name': self_user.display_name
                }
                response.append(item)
            self.accept()
            self.send(text_data=json.dumps({"type": "CHAT_LIST", "chats": response}))

    def disconnect(self, close_code):
        self.channel_layer.group_discard(
            "main", self.channel_name
        )

    def receive(self, text_data: Any = None, bytes_data: Any = None) -> None:
        user = self.scope["user"]
        text_data_json = json.loads(text_data)
        message = text_data_json

        if message["type"] == "JOIN_CHAT":
            chat = Chat.objects.get(uuid=message["chat_uuid"])
            messages = Message.objects.filter(chat=chat)
            response = []
            for message in messages:

                item = {"message": message.content, "sender": message.sender.display_name, "chat_uuid": str(message.chat.uuid), "date": str(message.created)}
                response.append(item)

            data = { "type": "CHAT_MESSAGES", "messages": response,
                    "chat_uuid": str(chat.uuid), "user": user.id}
            self.send(text_data=json.dumps(data))
            return

        if message["type"] == "SEND_MESSAGE":
            chat = Chat.objects.get(uuid=message["chat_uuid"])
            new_message = Message(sender= self.scope["user"], chat_id=chat.pkid, content=message["message"])
            new_message.save()
            data = {"date": str(datetime.now()),"type": "CHAT_MESSAGE", "message": message["message"], "chat_uuid": message["chat_uuid"], "sender": user.display_name}
            async_to_sync(self.channel_layer.group_send)(
                message["chat_uuid"], data
            )
            self.send(text_data=json.dumps(message))
            return

    def CHAT_MESSAGE(self, event):
        self.send(text_data=json.dumps( event))
