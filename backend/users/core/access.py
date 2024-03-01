from users.models.user import User


class Access:
	def __init__(self, user: User):
		self.user = user

	def check_access(self, entity: str, action="GET"):
		if entity == "resume":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				# get from db customer paid  resumes view until...
					#if self.user.has_resume_access == False:
					#return 403
				return 200
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

		return 200
