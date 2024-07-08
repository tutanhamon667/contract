import django_tables2 as tables

from users.models.common import ModerateRequest
from users.models.user import Region

class ReviewsOnModerationTable(tables.Table):
	reason_object_id =   tables.Column(linkify=True)
	class Meta:
		model = ModerateRequest
		template_name = "table.html"
		
		
class CompanyOnModerationTable(tables.Table):
	reason_object_id =   tables.Column(linkify=True)
	class Meta:
		model = ModerateRequest
		template_name = "table.html"
		fields = ("id", "reason", "status", "comment", "final_comment", "created_at", "reason_object_id", "reason_content_type")
  
  
class JobOnModerationTable(tables.Table):
	reason_object_id =   tables.Column(linkify=True)
	class Meta:
		model = ModerateRequest
		template_name = "table.html"
		fields = ("id", "reason", "status", "comment", "final_comment", "created_at", "reason_object_id", "reason_content_type")