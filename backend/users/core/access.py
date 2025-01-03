from contract.settings import USER_ACTIONS
from users.models.user import User, Resume, Job, Company, ResponseInvite
from btc.models import CustomerAccessPayment, JobPayment
import datetime

from django.utils import timezone
class Access:
	def __init__(self, user: User):
		self.user = user

	def user_access(self, entity, entity_id = None, action='get'):
		pass

	def check_access(self, entity: str, entity_id=None, action=USER_ACTIONS["get"]):


		if entity == "customer_responses_invites_view":
			
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 200
			else:
				return 403
		if entity == "create_ticket":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer or self.user.is_worker:
				return 200
			else:
				return 403
		if entity == "profile_resume_access_pay":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 200
			else:
				return 403



		if entity == "worker_responses_invites_view":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_worker:
				return 200
			else:
				return 403
		if entity == "response_invite":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				if action == "create":
					try:
						company = Company.objects.get(user=self.user)
						job = Job.check_company_active_job(company, int(entity_id))
						if len(job) > 0:
							return 200
						else:
							return 403
					except Exception as e:
						return 403
				if action == "update":
					try:
						job = ResponseInvite.objects.get(id=entity_id, job__company__user=self.user)
						return 200
					except Exception as e:
						return 403
			if self.user.is_worker:
				if action == "create":
					try:
						resume = Resume.objects.get(user=self.user, id=entity_id)
						return 200
					except Exception as e:
						return 403
				if action == "update":
					try:
						resume = ResponseInvite.objects.get(id=entity_id, resume__user=self.user)
						return 200
					except Exception as e:
						return 403
			return 403
		if entity == "self_resumes":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 403
			if self.user.is_worker:
				return 200
			return 403
		if entity == "self_contacts":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 200
			if self.user.is_worker:
				return 200
			return 403
		if entity == "acivate_account":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				company = Company.objects.get(user=self.user)
				if company.moderated is True:
					return 403
				else:
					return 200
			else:
				return 403
		if entity == "profile_job_pay_tier":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 200
			else:
				return 404

		if entity == "create_invite_response":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				try:
					company = Company.objects.get(user=self.user)
					if company.moderated is False:
						return 666
					job = Job.check_company_active_job(company, int(entity_id))
					if len(job) > 0:
						return 200
					else:
						return 403
				except Exception as e:
					return 503
		
		if entity == "profile_resume_edit":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 503
			if self.user.is_worker and entity_id:
				try:
					owner = Resume.objects.get(user=self.user, id=entity_id)
					return 200
				except Exception as e:
					print(e)
					return 403
			else:
				return 403
		if entity == "profile_resume_create":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				return 503
			if self.user.is_worker:
				return 200
			else:
				return 403
		if entity == "resume":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				try:
					company = Company.objects.get(user=self.user)
					today = datetime.datetime.now()
					customer_access = CustomerAccessPayment.objects.get(start_at__lte=timezone.now(),
																		expire_at__gte=timezone.now(), user=self.user)
					return 200
				except Exception as e:
					print(e)
					return 503
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
				# if self.user.has_resume_access == False:
				# return 403
				return 200
			else:
				return 404

		if entity == "profile_job":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				if action == "create":
	
					# get from db customer paid  resumes view until...
					# if self.user.has_resume_access == False:
					# return 403
					return 200
				if action == "update":
					company = Company.objects.get(user=self.user)
					job = Job.objects.filter(company__user_id=self.user.id, id=entity_id)
					if len(job):
						return 200
					else:
						return 404
			else:
				return 404

		if entity == "profile_company":
			if not self.user.is_authenticated:
				return 401
			if self.user.is_customer:
				# get from db customer paid  resumes view until...
				# if self.user.has_resume_access == False:
				# return 403
				return 200
			else:
				return 404
		if entity == "profile_invite_response":
			if not self.user.is_authenticated:
				return 401
			else:
				return 200

		return 200
