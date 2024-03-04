import json
from typing import Any

from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder

from chat.models import Chat


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(self.scope["user"])
        user = self.scope["user"]
        if not user.id:
            await self.disconnect(403)
        else:
            self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
            self.room_group_name = "chat_%s" % self.room_name

            await self.channel_layer.group_add(
                self.room_group_name, self.channel_name
            )
            await self.accept()
            if self.room_name == "main":
                response = []
                chats =  Chat.get_user_chats(user)
                for chat in chats :

                    item = {"user":None, "other_user": None, "uuid": chat.uuid}
                    if chat.worker and user.is_worker:
                        item["user"] = chat.worker.display_name
                        if chat.customer:
                            item["other_user"] = chat.customer.display_name
                        if chat.moderator:
                            item["other_user"] = chat.moderator.display_name
                    if chat.customer and user.is_customer:
                        item["user"] = chat.customer.display_name
                        if chat.worker:
                            item["other_user"] = chat.worker.display_name
                        if chat.moderator:
                            item["other_user"] = chat.moderator.display_name
                    if chat.moderator and user.is_moderator:
                        item["user"] = chat.moderator.display_name
                        if chat.worker:
                            item["other_user"] = chat.worker.display_name
                        if chat.modecustomer:
                            item["other_user"] = chat.customer.display_name

                    response.append(item)
                await self.send(text_data=json.dumps({"chats": response}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data: Any = None, bytes_data: Any = None) -> None:
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    async def chat_message(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))