import datetime

from dateutil.relativedelta import relativedelta
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect

from btc.libs.balance import Balance
from btc.models import JobPayment, BuyPaymentPeriod, JobTier, Address, Operation
from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.settings import RESPONSE_INVITE_STATUS, CHAT_TYPE
from users.core.access import Access
from users.models.user import Company, Member, Resume, Contact, Job, ResponseInvite
from users.forms import JobForm, JobPaymentTarifForm
from django.contrib.contenttypes.models import ContentType
from django.core.cache import cache
from django.db import transaction

class JobView:
	def __init__(self):
		pass

	def create(self, request):
		user = request.user
		if user.is_authenticated:
			try:
				access = Access(user)
				code = access.check_access("profile_job")
				if code != 200:
					if code == 401:
						return redirect('signin')
					else:
						return HttpResponse(status=code)
				articles = Article.objects.all()
				categories = ArticleCategory.objects.all()
				form = JobForm(request.POST, )
				company = Company.objects.get(user_id=user.id)
				form.company_id = company.id
				if form.is_valid():
					form.save()
					messages.success(request, 'Вакансия создана')
					return redirect('profile_jobs')
				else:
					return render(request, './blocks/profile/profile_job_create.html',
								  {'form': form,
								   'categories': categories,
								   'articles': articles
								   })

			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")

	def update(self, request, job_id):
		user = request.user
		if user.is_authenticated:
			try:
				access = Access(user)
				code = access.check_access("profile_job")
				if code != 200:
					if code == 401:
						return redirect('signin')
					else:
						return HttpResponse(status=code)
				articles = Article.objects.all()
				categories = ArticleCategory.objects.all()
				if request.method == "GET":
					company = Company.objects.get(user_id=user.id)
					job = Job.objects.get(company=company.id, id=job_id)
					if job:
						form = JobForm(instance=job)
						return render(request, './blocks/profile/profile_job_update.html', {
							'form': form,
							'categories': categories,
							'articles': articles
						})
					else:
						return HttpResponse(status=404)
				else:
					company = Company.objects.get(user_id=user.id)
					job = Job.objects.get(company=company.id, id=job_id)
					form = JobForm(request.POST, instance=job)
					form.company_id = company.id
					if form.is_valid():
						form.save()
						messages.success(request, 'Вакансия обновлена')
						return redirect(to='profile_jobs')
					return render(request, './blocks/profile/profile_job_update.html', {
						'form': form,
						'categories': categories,
						'articles': articles
					})
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")

	@transaction.atomic
	def pay_for_tier(self, request, job_id):
		user = request.user
		if user.is_authenticated:
			try:
				access = Access(user)
				code = access.check_access("profile_job_pay_tier", job_id)
				if code != 200:
					if code == 401:
						return redirect('signin')
					else:
						return HttpResponse(status=code)
				articles = Article.objects.all()
				categories = ArticleCategory.objects.all()
				job = Job.objects.get(id=job_id)
				active_job_payment = JobPayment.get_job_active_payment(job)
				if active_job_payment:
					payment_form = JobPaymentTarifForm(initial={"tier": active_job_payment.job_tier.id, "amount": active_job_payment.amount.id })
				else:
					payment_form = JobPaymentTarifForm()
				if request.method == "GET":
					return render(request, './blocks/profile/job_tier_payment.html', {
						'payment_form':payment_form,
						'job':job,
						'categories': categories,
						'articles': articles
					})
				else:
					form = JobPaymentTarifForm(request.POST)
					if form.is_valid():
						d1 = datetime.datetime.now()
						amount = BuyPaymentPeriod.objects.get(id=form.cleaned_data["amount"].id)
						tier = JobTier.objects.get(id=form.cleaned_data["tier"].id)

						active_job_payment = JobPayment.get_job_active_payment(job)
						if active_job_payment is False:
							expire_date = d1 + relativedelta(months=1)
							final_price_usd = round(
								float(tier.cost) * float(amount.amount) * ((100 - amount.discount) / 100), 2)
							btc_usd = cache.get("btc_usd")
							if not btc_usd:
								btc_usd = Balance.update_btc_usd()
							final_price_btc = final_price_usd / btc_usd
							user_balance = Balance(user)
							ost = user_balance.check_payment(final_price_btc)
							if ost > 0:
								new_job_payment = JobPayment(job=job, job_tier_id=tier.id, amount_id=amount.id, expire_at=expire_date)
								new_job_payment.save()
								address = Address.objects.get(user=user)
								job_payment_content_type = ContentType.objects.get_for_model(JobPayment)


								new_operation = Operation(address=address, cost_btc=final_price_btc, cost_usd=final_price_usd, status=0,
														  reason_content_type=job_payment_content_type,
														  reason_object_id=new_job_payment.id)
								new_operation.save()
								messages.success(request, 'Вакансия обновлена')
								return redirect('profile_jobs')
							else:
								messages.error(request, f'Недостаточно денег на счету, пополните баланс на {ost} btc')
					return render(request, './blocks/profile/job_tier_payment.html', {
						'payment_form': payment_form,
						'job': job,
						'categories': categories,
						'articles': articles
					})
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")

	def delete(self, request):
		if request.user.is_authenticated:
			try:

				messages.success(request, 'Отклик удалён')
				return redirect(request.POST["redirect"])
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")


profile_job_view = JobView()
