import json

from django.http import HttpResponse, JsonResponse

from btc.libs.balance import Balance
from btc.libs.btc_wallet import get_wallet, get_addresses_count, generate_address
from btc.models import JobPayment
from chat.models import Chat
from common.models import ArticleCategory, Article
from orders.models import JobSpecialisationStat
from btc.models import Address as WalletAddress, CustomerAccessPayment, Operation, Address
from users.core.access import Access
from users.models.advertise import Banners
from users.models.user import FavoriteJob, Job, ResponseInvite, CustomerReview, Company, Resume
import jsonpickle


def get_user(request):
	try:
		user = request.user
		photo = None
		if user.is_authenticated:
			if user.photo:
				photo = user.photo.url
			user = {"id": user.id,
					"display_name": user.display_name,
					"is_worker": user.is_worker,
					"is_customer": user.is_customer,
					"photo": photo}
		else:
			user = {"id": -1, "display_name": None,
					"is_worker": None,
					"is_customer": None,
					"photo": None}
		return JsonResponse({'success': True, 'data': user})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_balance(request):
	try:
		if request.user.is_authenticated:
			if request.user.is_customer:
				address = WalletAddress.objects.filter(user=request.user.id)
				profile_address = address[0]
				operations = Operation.objects.filter(address=profile_address)
				balance = Balance(profile_address, operations)

				return JsonResponse({'success': True, 'data': {'btc': balance.get_final_balance_btc,
															   'usd': balance.get_final_balance_usd}})
			else:
				return JsonResponse({'success': False, "code": 403})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def favorite_job(request):
	try:
		if request.user.is_authenticated:
			if request.user.is_worker:
				job_id = int(request.POST["job_id"])
				favorite_job = FavoriteJob.objects.filter(user=request.user, job_id=job_id)
				if len(favorite_job) == 0:
					favorite_job = FavoriteJob(job_id=job_id, user=request.user)
					favorite_job.save()
				elif len(favorite_job) == 1:
					favorite_job[0].delete()
				return JsonResponse({'success': True})
			else:
				return JsonResponse({'success': False, "code": 403})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_favorite_jobs(request):
	try:
		if request.user.is_authenticated:
			if request.user.is_worker:
				job_ids = request.POST["job_ids"]
				if not job_ids or len(job_ids) == 0:
					favorite_jobs = list(FavoriteJob.objects.filter(user=request.user).values())
				else:
					favorite_jobs = list(FavoriteJob.objects.filter(user=request.user, job_id__in=job_ids).values())
				return JsonResponse({'success': True, "data": favorite_jobs})
			else:
				return JsonResponse({'success': False, "code": 403})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_hot_jobs(request):
	try:
		hot_jobs = list(Job.get_hot_jobs(3).values())
		return JsonResponse({'success': True, "data": hot_jobs})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_categories_jobs(request):
	try:
		categories_stat = list(JobSpecialisationStat.objects.all().values())
		return JsonResponse({'success': True, "data": categories_stat})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_best_customers(request):
	try:
		best_customers = list(CustomerReview.get_top_companies(4).values())
		return JsonResponse({'success': True, "data": best_customers})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_banners(request):
	try:
		banners = list(Banners.objects.all().values())
		return JsonResponse({'success': True, "data": banners})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_new_jobs(request):
	try:
		new_jobs = list(Job.get_new_jobs(3).values())
		return JsonResponse({'success': True, "data": new_jobs})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def response_invite(request):
	try:
		user = request.user
		access = Access(user)
		resume_id = request.POST["resume_id"]
		action = request.POST["action"]
		job_id = request.POST["job_id"]
		ri_id = request.POST["id"]
		code = 403
		if action == 'create':
			if user.is_worker:
				code = access.check_access("response_invite", resume_id, action)
			if user.is_customer:
				code = access.check_access("response_invite", job_id, action)
		if action != 'create':
			if user.is_worker:
				code = access.check_access("response_invite", ri_id, 'update')
			if user.is_customer:
				code = access.check_access("response_invite", ri_id, 'update')

		if code != 200:
			if code == 401:
				return JsonResponse({'success': False, "code": code, "msg": "unauth"})
			elif code == 403:
				return JsonResponse({'success': True, "code": code, "msg": "not allowed"})
			else:
				return JsonResponse({'success': False, "code": code})
		status = 0
		res = {}
		if action == 'create':
			if user.is_worker:
				response = ResponseInvite.create_response(user, job_id, resume_id)
			if user.is_customer:
				response = ResponseInvite.create_invite(user, job_id, resume_id)
		elif action == 'accept':
			status = 1
		elif action == 'decline':
			status = 2
		elif action == 'delete':
			status = 3
		if action != 'create':
			response = ResponseInvite.update_response_invite(ri_id, user, status)
		res["id"] = response.id
		res["job_id"] = int(response.job_id)
		res["resume_id"] = int(response.resume_id)
		res["status"] = response.status
		res["type"] = response.type
		return JsonResponse({'success': True, "data": res})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_user_resumes(request):
	try:
		user = request.user
		access = Access(user)
		code = access.check_access("self_resumes")
		if code != 200:
			if code == 401:
				return JsonResponse({'success': False, "code": code, "msg": "unauth"})
			elif code == 403:
				return JsonResponse({'success': True, "code": code, "msg": "not allowed"})
			else:
				return JsonResponse({'success': False, "code": code})
		resumes = list(Resume.objects.filter(user=user).values())
		return JsonResponse({'success': True, "data": resumes})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def favorite_jobs(request):
	try:
		if request.user.is_authenticated:

			jobs = Job.objects.filter(favoritejob__user_id=request.user)
			companies = Company.join_companies(jobs)
			res = list(jobs.values())
			payments = list(JobPayment.join_tier(objs=jobs).values())
			companies_arr = []
			for company in companies:
				logo = None
				if company["logo"]:
					logo = company["logo"]
				companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"]})
			invites = []
			favorites = []
			if request.user.is_authenticated:
				invites = list(ResponseInvite.join_invites(objs=jobs, user=request.user).values())
				if request.user.is_worker:
					favorites = list(FavoriteJob.join_favorites(objs=jobs, user=request.user).values())

			for r in res:
				r["company"] = {}
				for company in companies_arr:
					if company["id"] == r["company_id"]:
						r["company"] = company
				r["invite"] = {}
				for invite in invites:
					if r["id"] == invite["job_id"]:
						if invite["status"] == 1:
							try:
								chat = Chat.objects.get(response_invite_id=invite["id"])
								invite["chat"] = {"uuid": chat.uuid}

							except Exception as e:
								print(e)
						r["invite"] = invite
				for payment in payments:
					if r["id"] == payment["job_id"]:
						r["payment"] = payment
				r["favorite"] = {}
				for favorite in favorites:
					if r["id"] == favorite["job_id"]:
						favorite["checked"] = True
						r["favorite"] = favorite
			return JsonResponse({'success': True, "data": res})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_jobs(request):
	try:
		jobs = Job.search_filter_new(request, 10)
		companies = Company.join_companies(jobs)
		res = list(jobs.values())
		payments = list(JobPayment.join_tier(objs=jobs).values())
		companies_arr = []
		for company in companies:
			logo = None
			if company["logo"]:
				logo = company["logo"]
			companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"]})
		invites = []
		favorites = []
		if request.user.is_authenticated:
			invites = list(ResponseInvite.join_invites(objs=jobs, user=request.user).values())
			if request.user.is_worker:
				favorites = list(FavoriteJob.join_favorites(objs=jobs, user=request.user).values())

		for r in res:
			r["company"] = {}
			for company in companies_arr:
				if company["id"] == r["company_id"]:
					r["company"] = company
			r["invite"] = {}
			for invite in invites:
				if r["id"] == invite["job_id"]:
					if invite["status"] == 1:
						try:
							chat = Chat.objects.get(response_invite_id=invite["id"])
							invite["chat"] = {"uuid": chat.uuid}

						except Exception as e:
							print(e)
					r["invite"] = invite
			for payment in payments:
				if r["id"] == payment["job_id"]:
					r["payment"] = payment
			r["favorite"] = {}
			for favorite in favorites:
				if r["id"] == favorite["job_id"]:
					favorite["checked"] = True
					r["favorite"] = favorite
		return JsonResponse({'success': True, "data": res})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_menu(request):
	try:
		articles = list(Article.objects.all().values())
		categories = list(ArticleCategory.objects.all().values())
		return JsonResponse({'success': True, "data": {"articles": articles, "categoriest": categories}})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_balance(request):
	try:
		if request.user.is_authenticated:
			if request.user.is_customer:
				address = WalletAddress.objects.filter(user=request.user.id)
				if len(address) > 0:
					profile_address = address[0]
				else:
					wallet = get_wallet()
					addresses_count = get_addresses_count(wallet)
					address = generate_address(addresses_count + 1, wallet.mnemonic)
					profile_address = WalletAddress(address=address["address"], wif=address["wif"],
													key_id=address["key_id"], wallet=wallet, user=request.user)
					profile_address.save()
				operations = Operation.objects.filter(address=profile_address)
				balance = Balance(profile_address, operations)
				return JsonResponse({'success': True, "data": {"usd": balance.balance_usd, "btc": balance.balance_btc}})
			else:
				return JsonResponse({'success': False, "code": 403})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})
