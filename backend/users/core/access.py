from contract.settings import USER_ACTIONS
from users.models.user import User, Resume


class Access:
	def __init__(self, user: User):
		self.user = user

	def check_access(self, entity: str, entity_id=None, action=USER_ACTIONS["get"]):
		if entity == "resume":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				# get from db customer paid  resumes view until...
					#if self.user.has_resume_access == False:
					#return 403
				return 200
			if self.user.is_worker and entity_id:
				try:
					owner = Resume.objects.get(user=self.user, id=entity_id)
					return 200
				except Exception as e:
					print(e)
					return 403
			else:
				return 403
		if entity == "review":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_worker:
				return 200
			else:
				return 403

		if entity == "profile_resume":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_worker:
				# get from db customer paid  resumes view until...
					#if self.user.has_resume_access == False:
					#return 403
				return 200
			else:
				return 404

		if entity == "profile_job":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				# get from db customer paid  resumes view until...
					#if self.user.has_resume_access == False:
					#return 403
				return 200
			else:
				return 404

		if entity == "profile_company":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				# get from db customer paid  resumes view until...
					#if self.user.has_resume_access == False:
					#return 403
				return 200
			else:
				return 404
		if entity == "profile_invite_response":
			if not self.user.is_authenticated:
				return 401
			else:
				return 200

		return 200