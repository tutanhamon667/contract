import datetime

from dateutil.relativedelta import relativedelta
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect

from btc.libs.balance import Balance
from btc.models import JobPayment, BuyPaymentPeriod, JobTier, Address, Operation
from common.models import Article, ArticleCategory
from users.core.access import Access
from users.models.user import Company, Job
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
					job = form.save(commit=False)
					job.company_id = company.id
					job.save()
					messages.success(request, 'Вакансия создана')
					return redirect('profile_job_view_pay_for_tier', job.id)
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
					payment_form = JobPaymentTarifForm(
						initial={"tier": active_job_payment.job_tier.id, "amount": active_job_payment.amount.id})
				else:
					payment_form = JobPaymentTarifForm()
				if request.method == "GET":
					return render(request, './blocks/profile/job_tier_payment.html', {
						'payment_form': payment_form,
						'job': job,
						'categories': categories,
						'articles': articles
					})
				else:
					form = JobPaymentTarifForm(request.POST)
					if form.is_valid():

						amount = BuyPaymentPeriod.objects.get(id=form.cleaned_data["amount"].id)
						tier = JobTier.objects.get(id=form.cleaned_data["tier"].id)

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
							can_spend = user_balance.check_payment(final_price_btc)
							if can_spend < 0:
								status = 1
								start_at = None
								paid_at = None
								expire_at = None
								success_message = 'создан и ждёт оплаты'
							else:
								status = 0
								start_at = datetime.datetime.now()
								paid_at = start_at
								expire_at = start_at + relativedelta(months=amount.amount)
								success_message = 'оплачен'
							with transaction.atomic():
								try:
									new_job_payment = JobPayment.create_payment(tier.id, amount.id, job, start_at,
																				expire_at)
									new_operation = Operation.create_operation(user_address, new_job_payment,
																			   new_job_payment.id, final_price_btc,
																			   final_price_usd, paid_at, status)
									messages.success(request, f'Заказ №{new_job_payment.id} {success_message}')
									return redirect('profile_jobs')
								except Exception as e:
									messages.error(request, e)
						elif active_job_payment.job_tier_id == tier.id:
							if active_job_payment.expire_at:
								final_price_usd = round(
									float(tier.cost) * float(amount.amount) * (
											(100 - amount.discount) / 100), 2)
								btc_usd = cache.get("btc_usd")
								if not btc_usd:
									btc_usd = Balance.update_btc_usd()
								final_price_btc = final_price_usd / btc_usd
								can_spend = user_balance.check_payment(final_price_btc)
								if can_spend < 0:
									status = 1
									start_at = None
									expire_at = None
									paid_at = None
								else:
									status = 0
									start_at = active_job_payment.expire_at
									paid_at = start_at
									expire_at = start_at + relativedelta(months=amount.amount)
								with transaction.atomic():
									try:
										new_job_payment = JobPayment.create_payment(tier.id, amount.id, job, start_at,
																					expire_at)
										new_operation = Operation.create_operation(user_address, new_job_payment,
																				   new_job_payment.id, final_price_btc,
																				   final_price_usd, paid_at, status)
										messages.success(request, 'Заказ оплачен')
										return redirect('profile_jobs')
									except Exception as e:
										messages.error(request, e)
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
								can_spend = user_balance.check_payment(final_price_btc)
								if can_spend > 0:
									now = datetime.datetime.now()
									operation.status = 0
									operation.paid_at = now
									with transaction.atomic():
										if hold_operation:
											operation.cost_btc = final_price_btc + float(hold_operation.cost_btc)
											operation.cost_usd = final_price_usd + float(hold_operation.cost_usd)
											hold_operation.delete()
										else:
											operation.cost_btc = final_price_btc
											operation.cost_usd = final_price_usd
										active_job_payment.start_at = now
										active_job_payment.expire_at = now + relativedelta(months=amount.amount)
										operation.save()
										active_job_payment.save()
										messages.success(request, 'Заказ оплачен')
										return redirect('profile_jobs')
								else:
									messages.error(request, 'Недостаточно средств на оплату')
									return redirect('profile_jobs')
						else:
							# Переход на более дорогой тариф
							if active_job_payment.job_tier.cost > tier.cost:
								messages.error(request, f'Переход на более дешёвый тариф не возможен')
								return redirect('profile_jobs')
							# Вычисляем сколько прошло времени текущего активного тарифа
							if active_job_payment.expire_at is None:
								messages.error(request, f'Имеется не оплаченный счёт по данной вакансии')
								return redirect('profile_jobs')
							today = datetime.datetime.now().date()
							end_period = datetime.datetime.date(active_job_payment.expire_at)
							start_period = datetime.datetime.date(active_job_payment.start_at)
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
							today_datetime = datetime.datetime.now()
							active_job_payment.expire_at = today_datetime
							with transaction.atomic():
								prev_period_operation.save()
								active_job_payment.save()
								new_job_payment = JobPayment.create_payment(tier.id, amount.id, job, None,
																			None)
								hold_operation = Operation.create_operation(user_address, new_job_payment,
																		   new_job_payment.id, new_hold_period_cost_btc,
																		   new_hold_period_cost_usd, None, 2)
								final_price_usd = round(
									float(tier.cost) * float(amount.amount) * (
											(100 - amount.discount) / 100), 2) - new_hold_period_cost_usd
								btc_usd = cache.get("btc_usd")
								if not btc_usd:
									btc_usd = Balance.update_btc_usd()
								final_price_btc = final_price_usd / btc_usd
								new_operation = Operation.create_operation(user_address, new_job_payment,
																		   new_job_payment.id, final_price_btc,
																		   final_price_usd, None, 1)

								can_spend = user_balance.check_payment(final_price_btc)
								if can_spend > 0:
									start_at = today_datetime
									paid_at = start_at
									expire_at = start_at + relativedelta(months=amount.amount)

									new_operation.paid_at = paid_at
									new_operation.status = 0
									new_operation.cost_usd = new_operation.cost_usd + hold_operation.cost_usd
									new_operation.cost_btc = new_operation.cost_btc + hold_operation.cost_btc
									hold_operation.paid_at = paid_at
									hold_operation.status = 0
									new_job_payment.start_at = start_at
									new_job_payment.expire_at = expire_at
									new_operation.save()
									hold_operation.delete()
									new_job_payment.save()
									messages.success(request, f'Заказ №{new_job_payment.id} оплачен')
									return redirect('profile_jobs')
								else:
									messages.success(request, f'Заказ №{new_job_payment.id} ждёт оплаты')
									return redirect('profile_jobs')
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