from django.urls import reverse
from django.utils.lorem_ipsum import words
from django.views.generic.base import TemplateView
from django_filters.views import FilterView
from django.shortcuts import render, redirect
from users.tables import ReviewsOnModerationTable, CompanyOnModerationTable
from django_tables2 import MultiTableMixin, RequestConfig, SingleTableMixin, SingleTableView

from users.models.user import CustomerReview, Company, Job
from users.models.common import ModerateRequest
from users.forms import ModerateForm, CustomerReviewForm
from django.forms import modelform_factory
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from chat.models import Chat


def get_model_by_name(app_label, model_name):
	model = apps.get_model(app_label, model_name)
	return model

class ModerateView:
	
	def jobs(self, request):
		if request.user.is_moderator is False:
			return redirect('home')
		config = RequestConfig(request, paginate={"per_page": 5})
		table = CompanyOnModerationTable(ModerateRequest.objects.filter(reason_content_type=ContentType.objects.get_for_model(Job), status=0).order_by('-id'), prefix="new")
		table_all = CompanyOnModerationTable(ModerateRequest.objects.filter(reason_content_type=ContentType.objects.get_for_model(Job), status__gt=0).order_by('-id'), prefix="all")
		config.configure(table)
		config.configure(table_all)
		return render(request, "moderate/reviews.html", {"table": table, "table_all": table_all})
	def companies(self, request):
		if request.user.is_moderator is False:
			return redirect('home')
		config = RequestConfig(request, paginate={"per_page": 5})
		table = CompanyOnModerationTable(ModerateRequest.objects.filter(reason_content_type=ContentType.objects.get_for_model(Company), status=0).order_by('-id'), prefix="new")
		table_all = CompanyOnModerationTable(ModerateRequest.objects.filter(reason_content_type=ContentType.objects.get_for_model(Company), status__gt=0).order_by('-id'), prefix="all")
		config.configure(table)
		config.configure(table_all)
		return render(request, "moderate/reviews.html", {"table": table, "table_all": table_all})

	def reviews(self, request):
		if request.user.is_moderator is False:
			return redirect('home')
		"""Demonstrate the use of the bootstrap template"""
		table = ReviewsOnModerationTable(ModerateRequest.objects.filter(reason_content_type=ContentType.objects.get_for_model(CustomerReview)).order_by('-id'))
		RequestConfig(request, paginate={"per_page": 10}).configure(table)

		return render(request, "moderate/reviews.html", {"table": table})

	def review(self, request, pk):
		if request.user.is_moderator is False:
			return redirect('home')
		if request.method == "POST":
			instance = ModerateRequest.objects.get(id=pk)
			form = ModerateForm(request.POST or None, instance=instance)
			if form.is_valid():
				if form.cleaned_data.get("status") != 0:
					final_comment = form.cleaned_data.get("final_comment")
					status = form.cleaned_data.get("status")
					reason_obj = None
					if  instance.changes :
						reason_model = ContentType.objects.get_for_model(instance.reason)
						reason_obj = reason_model.model_class().objects.get(id=instance.reason.id)
					
					if status == 1:
						instance.accept(final_comment)
						instance.reason.moderated = True
						instance.save()
						if instance.changes:
							reason_obj.updateModeratedFields(instance.changes)
							owner = reason_obj.get_owner()
							chat = Chat.get_user_system_chat(owner)
							chat.create_system_message(f"Заявка на {instance.comment} №{instance.id} одобрена модератором.")
					elif status == 2:
						instance.decline(final_comment)
						instance.reason.moderated = False
						instance.save()
						if instance.changes:
							owner = reason_obj.get_owner()
							chat = Chat.get_user_system_chat(owner)
							chat.create_system_message(f"Заявка на {instance.comment} №{instance.id} не была одобрена модератором. Причина: {final_comment}")
					
			customer_review_form =  modelform_factory(instance.reason_content_type.model_class(), fields='__all__')
			for field_name, field in customer_review_form.base_fields.items():
				field.widget.attrs['disabled'] = 'disabled'
			customer_review = customer_review_form(instance=instance.reason_content_type.model_class().objects.get(id=instance.reason_object_id))
			return render(request, "moderate/review.html", {"pk": pk, "form": form, "instance": instance, "customer_review": customer_review})
		else:
			instance = ModerateRequest.objects.get(id=pk)
			customer_review_form =  modelform_factory(instance.reason_content_type.model_class(), fields='__all__')
			for field_name, field in customer_review_form.base_fields.items():
				field.widget.attrs['disabled'] = 'disabled'
			customer_review = customer_review_form(instance=instance.reason_content_type.model_class().objects.get(id=instance.reason_object_id))
			form = ModerateForm(request.POST or None, instance=instance)
			return render(request, "moderate/review.html", {"pk": pk, "form": form, "instance": instance, "customer_review": customer_review})
		

moderate = ModerateView()