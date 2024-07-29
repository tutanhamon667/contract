from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect

from users.forms import CompanyReviewForm
from users.models.common import Captcha
from users.models.user import ResponseInvite, CustomerReview


class CommentView:
	def __init__(self):
		pass

	def create(self, request):
		if request.user.is_authenticated:
			try:
				if request.user.is_authenticated == False:
					return redirect('signin')
				if request.user.is_customer:
					return HttpResponse(status=403)
				form = CompanyReviewForm(request.POST, initial={"moderated": False, "reviewer": request.user})
				hash_key = request.POST.get("hashkey")
				res = Captcha.check_chaptcha(captcha=request.POST.get("captcha"), hash=hash_key)
				if res:
					edited_form = form.save(commit=False)
					edited_form.reviewer = request.user
					edited_form.moderated = False
					edited_form.save()
					return redirect(request.POST["redirect"])
			except Exception as e:
				print(e)
				return HttpResponse(500)
		else:
			return redirect(to="signin")

comment_view = CommentView()