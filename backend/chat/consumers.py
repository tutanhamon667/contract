import json
from datetime import datetime
from typing import Any
from uuid import UUID
from channels.generic.websocket import WebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder
from asgiref.sync import async_to_sync
from chat.models import Chat, Message, FileMessage


class UUIDEncoder(json.JSONEncoder):
	def default(self, obj):
		if isinstance(obj, UUID):
			# if the obj is uuid, we simply return the value of uuid
			return obj.hex
		return json.JSONEncoder.default(self, obj)


class ChatConsumer(WebsocketConsumer):

	def get_users_from_chat(self, chat, user):
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
		return self_user, other_user

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

				if len(messages):
					file_name = None
					file_path = None
					file_id = None
					if messages[0].type == 2:
						file_id = messages[0].file.id
						file_name = messages[0].file.name
						file_path = messages[0].file.existingPath
					last_message = [{"message": messages[0].content, "file_path": file_path, "file_name": file_name,
									 "file_id": file_id, "message_type": messages[0].type,
									 "sender": messages[0].sender.display_name, "sender_id": messages[0].sender.id,
									 "chat_uuid": str(messages[0].chat.uuid), "created": str(messages[0].created)}]
				else:
					last_message = []
				chat_title = ''
				if chat.response_invite:
					chat_title = chat.response_invite.job.title
				item = {"self_user": None, "other_user": None, "chat_uuid": str(chat.uuid), "messages": last_message,
						"not_read_count": 0, "chat_title": chat_title}

				self_user, other_user = self.get_users_from_chat(chat, user)

				if other_user.photo:
					other_user_photo = other_user.photo.url
				else:
					other_user_photo = None
				if self_user.photo:
					self_user_photo = self_user.photo.url
				else:
					self_user_photo = None
				item["other_user"] = {
					'photo': other_user_photo,
					'display_name': other_user.display_name
				}
				item["self_user"] = {
					'photo': self_user_photo,
					'display_name': self_user.display_name
				}
				not_read_messages = Message.objects.filter(chat=chat, sender=other_user, read=False)
				item["not_read_count"] = len(not_read_messages)
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
			messages = Message.objects.filter(chat=chat).order_by('id')
			response = []
			for db_message in messages:
				file_name = None
				file_path = None
				file_id = None
				if db_message.type == 2:
					file_name = db_message.file.name
					file_id = db_message.file.id
					file_path = db_message.file.existingPath
				item = {"message": db_message.content, "file_path": file_path, "file_name": file_name,
						"message_type": db_message.type, "file_id": file_id, "sender_id": db_message.sender.id,
						"sender": db_message.sender.display_name,
						"chat_uuid": str(db_message.chat.uuid), "read": db_message.read,
						"created": str(db_message.created)}
				response.append(item)

			data = {"type": "CHAT_MESSAGES", "messages": response,
					"chat_uuid": str(chat.uuid), "user": user.id}
			self.send(text_data=json.dumps(data))
			return

		if message["type"] == "SEND_MESSAGE":
			chat = Chat.objects.get(uuid=message["chat_uuid"])
			if message["file_id"]:
				file_message = FileMessage.objects.get(id=message["file_id"])
				if file_message.uploader != user:
					return
			new_message = Message(sender=self.scope["user"], chat_id=chat.pkid, content=message["message"],
								  type=message["message_type"], file_id=message["file_id"])
			new_message.save()
			file_name = None
			file_path = None
			file_id = None
			if new_message.type == 2:
				file_name = new_message.file.name
				file_id = new_message.file.id
				file_path = new_message.file.existingPath
			data = {"created": str(datetime.now()), "type": "CHAT_MESSAGE", "message": message["message"],
					"file_id": file_id, "file_path": file_path, "file_name": file_name,
					"message_type": new_message.type,
					"chat_uuid": message["chat_uuid"], "sender": user.display_name, "read": new_message.read,
					"sender_id": user.id}
			async_to_sync(self.channel_layer.group_send)(
				message["chat_uuid"], data
			)

			self.send(text_data=json.dumps(message))

			return
		if message["type"] == "CHAT_UPDATED":
			data = {"created": str(datetime.now()), "type": "CHAT_UPDATED", "chat_uuid": message["chat_uuid"],
					"sender_id": user.id}
			async_to_sync(self.channel_layer.group_send)(
				message["chat_uuid"], data
			)
			return
		if message["type"] == "SET_MESSAGE_READ":
			date_until_read = message["created"]
			chat = Chat.objects.get(uuid=message["chat_uuid"])
			self_user, other_user = self.get_users_from_chat(chat, user)
			Message.objects.filter(chat__uuid=message["chat_uuid"], sender=other_user, read=False,
								   created__lte=date_until_read).update(read=True)
			not_read_messages = Message.objects.filter(chat=chat, sender=other_user, read=False)
			message = {"chat_uuid": message["chat_uuid"], "not_read_count": len(not_read_messages),
					   "type": "SET_MESSAGE_READ"}
			self.send(text_data=json.dumps(message))

	def CHAT_MESSAGE(self, event):
		self.send(text_data=json.dumps(event))

	def CHAT_UPDATED(self, event):
		self.send(text_data=json.dumps(event))
