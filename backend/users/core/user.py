from users.models.user import User
from django.contrib.auth import login, authenticate

class UserCore:

	def __init__(self, model: User):
		self.user_model = model

	@classmethod
	def login(cls, username: str, password: str, request):
		cls.error = {}
		user = authenticate(username=username, password=password)
		if user is not None:
			login(request, user)
			return True
		else:
			cls.error = {"code": 111, "msg": "Invalid username or password."}
			return False
