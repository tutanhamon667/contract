import json
from rest_framework import generics
from django.core import serializers
from django.forms import model_to_dict
import binascii
from django.http import HttpResponse, JsonResponse
from decimal import Decimal
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from users.models.user import Member, UserFile
from datetime import datetime
from django.contrib.contenttypes.models import ContentType
from dateutil.relativedelta import relativedelta
from btc.libs.balance import Balance
from btc.libs.btc_wallet import get_wallet, get_addresses_count, generate_address
from btc.models import JobPayment
from chat.models import Chat
from common.models import ArticleCategory, Article
from orders.models import JobSpecialisationStat
from btc.models import Address as WalletAddress, CustomerAccessPayment, Operation, Address
from users.core.access import Access
from users.forms import CompanyReviewForm, WorkerReviewForm
from users.models.advertise import Banners
from users.models.user import FavoriteJob, Job, ResponseInvite, CustomerReview, Company, Resume, Contact
from django.core.cache import cache
from btc.models import JobPayment, BuyPaymentPeriod, JobTier, Address, Operation

from users.models.common import ModerateRequest
from django.db import transaction

def get_user(request):
	try:
		user = request.user
		photo = None
		if user.is_authenticated:
			if user.photo:
				photo = user.photo.photo
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

@transaction.atomic
def leave_chat(request):
	try:
		if request.user.is_authenticated:
			chat = Chat.objects.get(id=request.POST["chat_id"])
			chat.leave(request.user)
			if chat.response_invite:
				response_invite = ResponseInvite.objects.get(id=chat.response_invite.id)
				response_invite.status = RESPONSE_INVITE_STATUS["DELETED"]
				response_invite.save()
			return JsonResponse({'success': True, 'data': {}})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_counters(request):
	try:
		if request.user.is_authenticated:
			if request.user.is_worker:
				not_viewed_response_invites = list(ResponseInvite.objects.filter(resume__user=request.user, viewed_by_worker=False, status=0).values())
			else:
				not_viewed_response_invites = list(
					ResponseInvite.objects.filter(job__company__user=request.user, viewed_by_customer=False, status=0).values())
			data = {}
			data["ri"] = not_viewed_response_invites
			return JsonResponse({'success': True, 'data': data})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_responses_invites(request):
	try:
		if request.user.is_authenticated:
			page = None
			limit = None
			type = None
			status = None
			order = None
			if "page" in request.POST:
				page = int(request.POST["page"])
			if "limit" in request.POST:
				limit = int(request.POST["limit"])
			if "type" in request.POST and request.POST["type"] :
				type = int(request.POST["type"])
			if "status" in request.POST:
				status = int(request.POST["status"])
			if "order" in request.POST:
				order = request.POST["order"]
			count = 0
			ris, count = ResponseInvite.filter_search(user=request.user, order=order, type=type, status=status,page=page, limit=limit)
			if request.user.is_worker:
				for ri in ris:
					ResponseInvite.objects.filter(id=ri.id).update(viewed_by_worker=True)
			else:
				for ri in ris:
					ResponseInvite.objects.filter(id=ri.id).update(viewed_by_customer=True)
			res = []
			for ri in ris:


				obj = model_to_dict(ri)
				obj["chat"] = {}
				obj["create_date"] = ri.create_date
				obj["job"] = model_to_dict(ri.job,["title", "id"] )
				obj["worker"] = model_to_dict(ri.resume.user, ["id", "display_name"])
				obj["resume"] = model_to_dict(ri.resume, ["id", "name"])
				obj["company"] = model_to_dict(ri.job.company, ["id", "name"])
				if ri.status == 1:
					chat = Chat.objects.filter(response_invite_id=obj["id"])
					if len(chat) > 0:
						chat = chat[0]
					obj["chat"] = {"uuid": str(chat.uuid)}
				res.append(obj)

			return JsonResponse({'success': True, "data": res, "count": count})
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


def create_review(request):
	if request.user.is_authenticated:
		print(request.POST)
		review_form = CompanyReviewForm(request.POST)
		if review_form.is_valid():
			review = CustomerReview(reviewer=request.user, moderated=False,
									company_id=review_form.cleaned_data.get("company_id")
									, rating=review_form.cleaned_data.get("rating")
									, comment=review_form.cleaned_data.get("comment"))
			review.save()
			review_request = ModerateRequest.create_request(CustomerReview, review.id, None, 'Создание отзыва')
			chat = Chat.get_user_system_chat(request.user)
			chat.create_system_message(f' Создана заявка № {review_request.id} на создание отзыва № {review.id} . Ждите проверки модератора')
			return JsonResponse({'success': True, "data": {} })
		else:
			return JsonResponse({'success': False, "data": review_form.errors, "code": 400})
	else:
		return JsonResponse({'success': False, "data": {}, 'code': 403})

def create_worker_review(request):
	user = request.user
	if user.is_authenticated and user.is_customer:
		print(request.POST)
		review_form = WorkerReviewForm(request.POST)
		if review_form.is_valid():
			resume = Resume.objects.get(id=review_form.cleaned_data.get("resume_id"))
			review = CustomerReview(reviewer=request.user, moderated=False,
									worker_id=resume.user.id
									, rating=review_form.cleaned_data.get("rating")
									, comment=review_form.cleaned_data.get("comment"))
			review.save()
			review_request = ModerateRequest.create_request(CustomerReview, review.id)
			return JsonResponse({'success': True, "data": {} })
		else:
			return JsonResponse({'success': False, "data": review_form.errors, "code": 400})
	else:
		return JsonResponse({'success': False, "data": {}, 'code': 403})


def worker_reviews(request):
	try:
		id = request.POST["resume_id"]
		page = None
		limit = None
		if "page" in request.POST:
			page = int(request.POST["page"])
		if "limit" in request.POST:
			limit = int(request.POST["limit"])
		resume = Resume.objects.get(id=id)
		if page is not None and limit is not None:
			count, reviews = CustomerReview.get_worker_reviews(user_id=resume.user.id, moderated=True, page=page, limit=limit)
		else:
			count, reviews = CustomerReview.get_worker_reviews(user_id=resume.user.id, moderated=True)

		reviews_array = []
		for review in reviews:
			reviews_array.append(
				{"comment": review.comment, "id": review.id, "pub_date": review.pub_date, "rating": review.rating,
				 "reviewer": review.reviewer.company.name})

		return JsonResponse({'success': True, "data": reviews_array, "count": count})
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



@transaction.atomic
def response_invite(request):
	try:
		user = request.user
		access = Access(user)

		action = request.POST["action"]

		ri_id = request.POST["id"]
		code = 403
		if action == 'create':
			if user.is_worker:
				resume_id = request.POST["resume_id"]
				code = access.check_access("response_invite", resume_id, action)
			if user.is_customer:
				job_id = request.POST["job_id"]
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
		response = None
		if action == 'create':
			resume_id = request.POST["resume_id"]
			job_id = request.POST["job_id"]
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
		if action == 'accept':
			if user.is_worker:
				chat = Chat(customer=response.job.company.user, worker=user, response_invite=response)
				chat.save()
			if user.is_customer:
				chat = Chat(customer=user, worker=response.resume.user, response_invite=response)
				chat.save()
		if action == 'decline':
			try:
				chat = Chat.objects.get(response_invite=response)
				if user.is_worker:
					chat.deleted_by_worker = True
				else:
					chat.deleted_by_customer = True
				chat.save()
			except Exception as e:
				print('Error:', e)
			
		if action == 'delete':
			ri = ResponseInvite.objects.get(id=ri_id)
			if user.is_worker:
				ri.deleted_by_worker = True
			else:
				ri.deleted_by_customer = True
			ri.save()
			if ri.deleted_by_customer and ri.deleted_by_worker:
				ri.set_deleted()
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
		resumes_db = Resume.objects.filter(user=user, deleted=False)
		resumes = list(resumes_db.values())
		for resume in resumes:
			item_regions = None
			for resume_db in resumes_db:
				if resume_db.id == resume["id"]:
					item_regions = resume_db.region
			if item_regions:
				resume["regions"] = list(item_regions.values())
			else:
				resume["regions"] = []
		return JsonResponse({'success': True, "data": resumes})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def favorite_jobs(request):
	try:
		if request.user.is_authenticated:

			jobs = Job.objects.filter(favoritejob__user_id=request.user, deleted=False)
			companies = Company.join_companies(jobs)
			res = list(jobs.values())
			payments = list(JobPayment.join_tier(objs=jobs).values())
			companies_arr = []
			for company in companies:
				logo = None
				if company["logo_id"]:
					logo = UserFile.objects.get(id=company["logo_id"]).logo
				companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"]})
			invites = []
			favorites = []
			if request.user.is_authenticated:
				invites = list(ResponseInvite.join_invites(objs=jobs, user=request.user).values())
				if request.user.is_worker:
					favorites = list(FavoriteJob.join_favorites(objs=jobs, user=request.user).values())
			for r in res:
				r["company"] = {}
				r["invite"] = {}
				r["favorite"] = {}
				r["payment"] = {}
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



def filter_resumes(request):
	try:
		user = request.user
		access = Access(user)
		code = access.check_access("resume")
		if code != 200:
			return JsonResponse({'success': False, "code": code})
		resumes_count, resumes = Resume.search_filter(request)
		res = list(resumes.values())
		for resume in res:
			item_regions = None
			for resume_db in resumes:
				if resume_db.id == resume["id"]:
					resume["display_name"] = resume_db.user.display_name
					item_regions = resume_db.region
					if resume_db.user.photo:
						resume["photo"] = '/media/' + resume_db.user.photo.photo
					else:
						resume["photo"] = None
			if item_regions:
				resume["regions"] = list(item_regions.values())
			else:
				resume["regions"] = []

		invites = []
		if request.user.is_authenticated:
			invites = list(ResponseInvite.join_responses(objs=resumes, user=request.user).values())

		for r in res:
			r["invite"] = {}
			for invite in invites:
				if r["id"] == invite["resume_id"]:
					if invite["status"] == 1:
						try:
							chat = Chat.objects.get(response_invite_id=invite["id"])
							invite["chat"] = {"uuid": chat.uuid}

						except Exception as e:
							print(e)
					r["invite"] = invite

		return JsonResponse({'success': True, "data": res, "count": resumes_count})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_jobs(request):
	try:
		jobs_count, jobs = Job.search_filter_new(request)
		companies = Company.join_companies(jobs)
		res = list(jobs.values())
		for job in res:
			item_regions = None
			for job_db in jobs:
				if job_db.id == job["id"]:
					item_regions = job_db.region
			job["regions"] = list(item_regions.values())
		payments = list(JobPayment.join_tier(objs=jobs).values())
		companies_arr = []
		for company in companies:
			logo = None
			if company["logo_id"]:
				logo = UserFile.objects.get(id=company["logo_id"]).logo
			companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"], "moderated": company["moderated"]})
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
		return JsonResponse({'success': True, "data": res, "count": jobs_count})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def calc_tier_payment(request):
	try:
		user = request.user
		access = Access(request.user)
		code = access.check_access("profile_job_pay_tier", request.POST["job_id"])
		if code != 200:
			return JsonResponse({'success': False, "code": code})
		amount = BuyPaymentPeriod.objects.get(id=request.POST["amount"])
		tier = JobTier.objects.get(id=request.POST["tier"])
		job = Job.objects.get(id=request.POST["job_id"])
		active_job_payment = JobPayment.get_job_active_payment(job)
		user_address = Address.objects.get(user=user)
		user_operations = Operation.objects.filter(address=user_address)
		user_balance = Balance(address=user_address, operations=user_operations)
		if active_job_payment is False:
			final_price_usd = round(
				float(tier.cost) * float(amount.amount) * (
						(100 - amount.discount) / 100), 2)
			btc_usd = cache.get("btc_usd")
			if not btc_usd:
				btc_usd = Balance.update_btc_usd()
			final_price_btc = final_price_usd / btc_usd
			can_spend_btc = user_balance.check_payment(final_price_btc)
		  
			if can_spend_btc < 0:
				status = 0
				start_at = datetime.now()
				paid_at = start_at
				expire_at = start_at + relativedelta(months=amount.amount)
				success_message = 'создан и ждёт оплаты'
			else:
				status = 1
				start_at = datetime.now()
				paid_at = start_at
				expire_at = start_at + relativedelta(months=amount.amount)
				success_message = 'оплачен'
		elif active_job_payment.job_tier_id == tier.id:
			if active_job_payment.expire_at:
				final_price_usd = round(
					float(tier.cost) * float(amount.amount) * (
							(100 - amount.discount) / 100), 2)
				btc_usd = cache.get("btc_usd")
				if not btc_usd:
					btc_usd = Balance.update_btc_usd()
				final_price_btc = final_price_usd / btc_usd
				can_spend_btc = user_balance.check_payment(final_price_btc)
				if can_spend_btc >= 0:
					status = 1
					start_at = active_job_payment.expire_at
					paid_at = start_at
					expire_at = start_at + relativedelta(months=amount.amount)
				else:
					status = 0
					start_at = active_job_payment.expire_at
					paid_at = start_at
					expire_at = start_at + relativedelta(months=amount.amount)
			else:
				job_payment_content_type = ContentType.objects.get_for_model(JobPayment)
				payment_operations = Operation.objects.filter(reason_content_type=job_payment_content_type,
																reason_object_id=active_job_payment.id)
				hold_operation = None
				payment_operation = payment_operations[0]
				if len(payment_operations) == 2:
					for operation in payment_operations:
						if operation.status == 2:
							hold_operation = operation
						else:
							payment_operation = operation

				operation = payment_operation
				final_price_usd = float(operation.cost_usd)
				btc_usd = cache.get("btc_usd")
				if not btc_usd:
					btc_usd = Balance.update_btc_usd()

				final_price_btc = final_price_usd / btc_usd
				can_spend_btc = user_balance.check_payment(final_price_btc)
				if can_spend_btc >= 0:
					now = datetime.now()
					status = 1
					operation.paid_at = now
				else:
					status = 0
				if hold_operation:
						final_price_btc = final_price_btc + float(hold_operation.cost_btc)
						final_price_usd = final_price_usd + float(hold_operation.cost_usd)
				else:
					final_price_btc = final_price_btc
					final_price_usd = final_price_usd
				start_at = now
				expire_at = now + relativedelta(months=amount.amount)
		else:
			# Переход на более дорогой тариф
			if active_job_payment.job_tier.cost > tier.cost:
 
				return JsonResponse({'success': True, "data": {}, "code": 400, "msg": "Переход на более дешёвый тариф не возможен"})
			# Вычисляем сколько прошло времени текущего активного тарифа
			if active_job_payment.expire_at is None:
				return JsonResponse({'success': True, "data": {}, "code": 400, "msg": "Имеется не оплаченный счёт по данной вакансии"})
			today = datetime.now().date()
			end_period = datetime.date(active_job_payment.expire_at)
			start_period = datetime.date(active_job_payment.start_at)
			# осталось дней
			delta_ost = end_period - today  # 45 days
			# прошло дней
			delta_left = today - start_period  # 15 days
			period_days = end_period - start_period

			# Получаем новую стоимость текущего тарифа
			discount = active_job_payment.amount.discount
			job_payment_content_type = ContentType.objects.get_for_model(JobPayment)
			prev_period_operation = Operation.objects.get(reason_content_type=job_payment_content_type,
															reason_object_id=active_job_payment.id)
			prev_period_cost_usd = float(prev_period_operation.cost_usd)
			prev_period_cost_btc = float(prev_period_operation.cost_btc)
			delta_days_pr = delta_left.days / period_days.days
			# новая стоимость текущей операции
			new_prev_period_cost_usd = prev_period_cost_usd * delta_days_pr
			new_prev_period_cost_btc = prev_period_cost_btc * delta_days_pr
			# сумма возврата на новую операции
			new_hold_period_cost_usd = prev_period_cost_usd - new_prev_period_cost_usd
			new_hold_period_cost_btc = prev_period_cost_btc - new_prev_period_cost_btc
			# закрываем текущую операцию
			prev_period_operation.cost_btc = new_prev_period_cost_btc
			prev_period_operation.cost_usd = new_prev_period_cost_usd
			today_datetime = datetime.now()
 
			final_price_usd = round(
				float(tier.cost) * float(amount.amount) * (
						(100 - amount.discount) / 100), 2) - new_hold_period_cost_usd
			btc_usd = cache.get("btc_usd")
			if not btc_usd:
				btc_usd = Balance.update_btc_usd()
			final_price_btc = final_price_usd / btc_usd
		
			can_spend_btc = user_balance.check_payment(final_price_btc)
			if can_spend_btc >= 0:
				status = 1
			else:
				status = 0
			#if can_spend > 0:
			start_at = today_datetime
			paid_at = start_at
			expire_at = start_at + relativedelta(months=amount.amount)
			final_price_usd = final_price_usd + new_hold_period_cost_usd
			final_price_btc = final_price_btc + new_hold_period_cost_btc

		res = {
			"final_price_usd": round(final_price_usd, 2),
			"final_price_btc": round(final_price_btc, 8),
			"can_spend_btc": round(can_spend_btc, 8),
			"can_spend_usd": round(can_spend_btc*btc_usd, 2),
			"start_at": start_at,
			"can_spend": status,
			"expire_at": expire_at,
		}
		return JsonResponse({'success': True, "code": 200,"data": res})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


@transaction.atomic	
def access_payment(request):
	try:
		user = request.user
		access = Access(request.user)
		code = access.check_access("profile_resume_access_pay")
		if code != 200:
			return JsonResponse({'success': False, "code": code})
		today = datetime.now()
		customer_access = CustomerAccessPayment.objects.filter(start_at__lte=timezone.now(),
															   expire_at__gte=timezone.now(), user=user)
		if len(customer_access) == 0:
			member = Member.objects.get(id=user.id)
			if member.is_worker:
				return HttpResponse(status=403)
			d1 = timezone.now()
			expire_date = d1 + relativedelta(months=1)
			ca = CustomerAccessPayment(user=user, start_at=d1, expire_at=expire_date, amount_id=1)
			ca.save()
			address = Address.objects.get(user=user)
			customer_access_content_type = ContentType.objects.get_for_model(CustomerAccessPayment)
			new_operation = Operation(address=address, cost_btc=0, cost_usd=0,  status=0, paid_at=d1,
			reason_content_type=customer_access_content_type, reason_object_id=ca.id)
		   # new_operation.save()
			return JsonResponse({'success': True, "code": 200,"data": {
				"expire_at": expire_date
			}})
		else:
			return JsonResponse({'success': True, "code": 400,"data": {}, "msg": "Уже есть активная бесплатная подписка"})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_job(request):
	try:
		if 'profile' in request.POST:
			
			jobs = Job.get_active_job(request.POST["id"])
		else:
			jobs = Job.get_paid_job(request.POST["id"])
		if len(jobs) == 0:
			return JsonResponse({'success': False, "msg": "Вакансия не активна"})
		res = list(jobs.values())
		companies = Company.join_companies(jobs)

		for job in res:
			item_regions = None
			for job_db in jobs:
				if job_db.id == job["id"]:
					item_regions = job_db.region
			job["regions"] = list(item_regions.values())
		payments = list(JobPayment.join_tier(objs=jobs).values())
		companies_arr = []
		for company in companies:
			logo = None
			if company["logo_id"]:
				logo = UserFile.objects.get(id=company["logo_id"]).logo
			companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"], "moderated": company["moderated"]})
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
		res = res[0]
		contacts = list(Contact.get_company_contacts(res["company"]["id"]))
		res["contacts"] = contacts
		rating = CustomerReview.get_company_rating(res["company"]["id"])
		reviews = list(CustomerReview.objects.filter(company_id=res["company"]["id"]).values())
		res["company"]["rating"] = rating
		res["company"]["reviews"] = len(reviews)
		return JsonResponse({'success': True, "data": res})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_company(request):
	try:
		id = request.POST["id"]
		company = list(Company.get_active_company(id).values())[0]
		rating = CustomerReview.get_company_rating(company["id"])
		reviews = list(CustomerReview.objects.filter(company_id=company["id"]))
		contacts = list(Contact.get_company_contacts(company["id"]))
		if company["logo_id"]:
			logo = UserFile.objects.get(id=company["logo_id"]).logo
		company["logo"] = logo
		company["contacts"] = contacts
		company["rating"] = rating
		company["reviews"] = len(reviews)
		return JsonResponse({'success': True, "data": company})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_resume_statistics(request):
	try:
		user = request.user
		access = Access(user)
		code = access.check_access("resume")
		if code != 200:
			return JsonResponse({'success': False, "code": code})
		result = {}
		resume_id = request.POST["id"]
		resume = Resume.objects.get(id=resume_id)
		worker = resume.user
		result["created_at"] = worker.created_at
		responses = list(ResponseInvite.get_resume_responses(resume_id).values())
		invites = list(ResponseInvite.get_resume_invites(resume_id).values())
		result["invites"] = invites
		result["responses"] = responses
		return JsonResponse({'success': True, "data": result})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})




def get_contacts(request):
	try:
		user = request.user
		access = Access(user)
		code = access.check_access("self_contacts")
		if code != 200:
			return JsonResponse({'success': False, "code": code})
		if request.user.is_customer:
			contacts = list(Contact.get_company_contacts(request.user.id))
		else:
			contacts = list(Contact.get_worker_contacts(request.user.id))
		return JsonResponse({'success': True, "data": contacts})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})



def get_profile_jobs(request):
	try:
		user = request.user
		access = Access(user)
		code = access.check_access("profile_job")
		if code != 200:
			if code == 666:
				return redirect('activate_view')
			if code == 401:
				return redirect('signin')
			else:
				return HttpResponse(status=code)
			if 'paid' in request.POST:
				company = Company.objects.get(user_id=user.id)
				jobs = Job.objects.filter(company=company.id)
				now = datetime.datetime.now()
				if request.POST["paid"] == "true":
					jobs_paid = jobs.filter(jobpayment__start_at__lte=now, jobpayment__expire_at__gte=now)
					return JsonResponse({'success': True, "data": {'paid': list(jobs_paid.values()), 'not_paid': list(jobs_not_paid.values())}})
				else:
					jobs_paid = jobs.filter(jobpayment__start_at__lte=now, jobpayment__expire_at__gte=now)
					jobs_not_paid_ids = []
					for job_paid in jobs_paid:
						jobs_not_paid_ids.append(job_paid.id)
					jobs_not_paid = jobs.filter().exclude(id__in=jobs_not_paid_ids)
					return JsonResponse({'success': True, "data": {'paid': list(jobs_paid.values()), 'not_paid': list(jobs_not_paid.values())}})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_resume(request):
	try:
		user = request.user
		access = Access(user)
		id = request.POST["id"]
		code = access.check_access("resume",id )
		if code != 200:
			return JsonResponse({'success': False, "code": code})
	   
		resume = Resume.get_active_resume(id)
		if len(resume) == 0:
			return JsonResponse({'success': False, "code": 404, "msg": "Резюме удалено или не активно"})
		resume_obj = list(resume.values())[0]
		reviews = list(CustomerReview.objects.filter(worker_id=resume[0].user.id))
		contacts = list(Contact.get_worker_contacts(resume[0].user.id))
		resume_obj["contacts"] = contacts
		if resume[0].user.photo:
			resume_obj["photo"] = '/media/' + resume[0].user.photo.photo
		else:
			resume_obj["photo"] = None
		resume_obj["display_name"] = resume[0].user.display_name
		resume_obj["reviews"] = len(reviews)
		invites = list(ResponseInvite.join_responses(objs=resume, user=request.user).values())
		item_regions = resume[0].region

		if item_regions:
			resume_obj["regions"] = list(item_regions.values())
		else:
			resume_obj["regions"] = []

		resume_obj["invite"] = {}
		for invite in invites:
			if resume_obj["id"] == invite["resume_id"]:
				if invite["status"] == 1:
					try:
						chat = Chat.objects.get(response_invite_id=invite["id"])
						invite["chat"] = {"uuid": chat.uuid}
					except Exception as e:
						print(e)
				resume_obj["invite"] = invite

		return JsonResponse({'success': True, "data": resume_obj})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def company_reviews(request):
	try:
		id = request.POST["company_id"]
		page = None
		limit = None
		if "page" in request.POST:
			page = int(request.POST["page"])
		if "limit" in request.POST:
			limit = int(request.POST["limit"])
		if page is not None and limit is not None:
			count, reviews = CustomerReview.get_company_reviews(company_id=id, moderated=True, page=page, limit=limit)
		else:
			count, reviews = CustomerReview.get_company_reviews(company_id=id, moderated=True)

		reviews_array = []
		for review in reviews:
			reviews_array.append({"comment":review.comment, "id":review.id, "pub_date":review.pub_date, "rating":review.rating,
								  "reviewer":review.reviewer.display_name})

		return JsonResponse({'success': True, "data": reviews_array, "count": count})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_menu(request):
	try:
		articles = list(Article.objects.all().values())
		categories = list(ArticleCategory.objects.all().values())
		return JsonResponse({'success': True, "data": {"articles": articles, "categoriest": categories}})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def convert_to_string(number):
	"""
	Converts a number to a readable string representation.

	Parameters:
	number (float or int): The number to be converted.

	Returns:
	str: The readable string representation of the number.
	"""
	if isinstance(number, int):
		return str(number)
	elif isinstance(number, float):
		# Check if the number is a small decimal
		if abs(number) < 1e-3:
			return f"{number:.7f}"
		else:
			return str(number)
	else:
		raise ValueError("Invalid input type. Please provide a float or int.")

class CustomEncoder(json.JSONEncoder):
	def default(self, obj):
		if isinstance(obj, datetime):
			return obj.timestamp()
		if isinstance(obj, Decimal):
			return float(obj)
		return super().default(obj)
	
def get_user_transactions(request):
	#try:
		user = request.user
		if request.user.is_authenticated:
			if request.user.is_customer:
				limit = 1
				page = 0
				_post = request.POST
				if "page" in _post:
					page = int(_post["page"])
				if "limit" in _post:
					limit = int(_post["limit"])
				profile_address = None
				address = WalletAddress.objects.filter(user=user.id)
				profile_address = address[0]
				raw_op = Operation.objects.filter(address=profile_address).order_by('paid_at')
				count = len(raw_op)
				incoming_transactions = profile_address.get_address_incoming_transactions()
				formatted_incoming_transactions = []
				for transaction in incoming_transactions:
					new_item = {}
					new_item["type"] = "INCOMING"
					new_item["paid_at"] = timezone.make_aware(transaction["paid_at"])
					new_item["txid"] = transaction["txid"].decode()
					new_item["transaction_id"] =  transaction["transaction_id"] 
					new_item["key_id"] =  transaction["key_id"] 
					new_item["value"] =  transaction["value"] 
					new_item["date"] =  transaction["date"] 
					new_item["transaction_id"] =  transaction["transaction_id"] 
					formatted_incoming_transactions.append(new_item)

				
				formatted_operations = []
				for operation in raw_op:
					item = model_to_dict(operation)
					item["type"] = "OUTGOING"
					formatted_operations.append(item)
				
				combined_array = formatted_operations + formatted_incoming_transactions
				sorted_array = sorted(combined_array, key=lambda x: x['paid_at'], reverse=True)
				sorted_array = sorted_array[(page * limit):(page * limit + limit)]
				final_array = []
				for item in sorted_array:
					for key, obj in item.items():
						if not isinstance(obj, str) and not isinstance(obj, int):
							item[key] = json.dumps(item[key], cls=CustomEncoder, ensure_ascii=False)
			   
				return JsonResponse({'success': True, "data": {
					"transactions": sorted_array ,
					"count": count
				}})
			else:
				return JsonResponse({'success': False, "code": 403})
		else:
			return JsonResponse({'success': False, "code": 401})
	#except Exception as e:
	#	return JsonResponse({'success': False, "code": 500, "msg": str(e)})

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
				return JsonResponse({'success': True, "data": {
									"address": profile_address.address,
									"usd": balance.get_final_balance_usd,
									"btc": convert_to_string(balance.get_final_balance_btc)}})
			else:
				return JsonResponse({'success': False, "code": 403})
		else:
			return JsonResponse({'success': False, "code": 401})
	except Exception as e:
		return JsonResponse({'success': False, "code": 500, "msg": str(e)})
