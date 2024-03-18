from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect

from chat.models import Chat
from common.models import Article, ArticleCategory
from contract.settings import RESPONSE_INVITE_STATUS, CHAT_TYPE
from users.core.access import Access
from users.models.user import Company, Member, Resume, Contact, Job, ResponseInvite
from users.forms import JobForm


class ResponseInviteView:
	def __init__(self):
		pass

	def create(self, request):
		if request.user.is_authenticated:
			try:
				access = Access(request.user)
				code = access.check_access("create_invite_response")
				if code != 200:
					if code == 401:
						return redirect('signin')
					if code == 503:
						articles = Article.objects.all()
						categories = ArticleCategory.objects.all()
						return render(request, './pages/customer_access_denied.html', {
							'articles': articles,
							'categories': categories,
						})
					else:
						return HttpResponse(status=code)
				user = request.user
				job_id = request.POST["job"]
				resume_id = request.POST["resume"]
				res = ResponseInvite.create_response(user, job_id, resume_id)
				if not res:
					return HttpResponse(status=500)
				messages.success(request, 'Отклик отправлен')
				return redirect(request.POST["redirect"])
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")

	def cancel(self, request):
		if request.user.is_authenticated:
			try:
				user = request.user
				res = ResponseInvite.update_response_invite(request.POST["request_invite_id"], user,
															request.POST["status"])
				if not res:
					return HttpResponse(status=500)
				messages.success(request, 'Отклик отменён')
				return redirect(request.POST["redirect"])
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")
		pass

	def update(self, request):
		if request.user.is_authenticated:
			try:
				user = request.user
				status = int(request.POST["status"])
				res = ResponseInvite.update_response_invite(request.POST["request_invite_id"], user, status)
				if not res:
					return HttpResponse(status=500)
				if status == RESPONSE_INVITE_STATUS["ACCEPTED"]:
					chat = Chat(customer=res.job.company.user, worker=res.resume.user, type=CHAT_TYPE["RESPONSE_INVITE"], response_invite=res)
					chat.save()
				messages.success(request, 'Отклик отправлен')
				return redirect(request.POST["redirect"])
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")

	def delete(self, request):
		if request.user.is_authenticated:
			try:
				user = request.user
				res = ResponseInvite.update_response_invite(request.POST["request_invite_id"], user,
															RESPONSE_INVITE_STATUS["DELETED"])
				response_invite = ResponseInvite.objects.get(id=request.POST["request_invite_id"])
				response_invite.set_deleted()
				if not res:
					return HttpResponse(status=500)
				messages.success(request, 'Отклик удалён')
				return redirect(request.POST["redirect"])
			except Exception as e:
				print(e)
				return HttpResponse(status=500)
		else:
			return redirect(to="signin")


response_invite_view = ResponseInviteView()