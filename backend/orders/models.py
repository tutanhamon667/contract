from django.db import models as basic_models
from users.models.user import Member, Company, Specialisation, User, Industry


class JobSpecialisationStat(basic_models.Model):

	industry = basic_models.ForeignKey(to=Industry, verbose_name="Индустрия", on_delete=basic_models.PROTECT)

	name = basic_models.CharField(
		verbose_name='Название категории', max_length=50
	)

	icon = basic_models.CharField(
		verbose_name='Icon', max_length=100
	)

	count = basic_models.BigIntegerField(
		default=0,
		verbose_name='Количество'
	)

	min_from = basic_models.BigIntegerField(
		default=0,
		verbose_name='минимальная зп 2'
	)
	min_to = basic_models.BigIntegerField(
		default=0,
		verbose_name='минимальная зп 2'
	)
	class Meta:
		managed = False
		db_table = 'job_categories_info'

	@property
	def get_min(self):
		if self.min_from is None:
			self.min_from = 0
		if self.min_to is None:
			self.min_to = 0
		if self.min_from > self.min_to:
			return self.min_to
		else:
			return self.min_from

