from django.db import models as basic_models
from users.models.user import Member, Company, Specialisation, User


class JobSpecialisationStat(basic_models.Model):

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

    min_one = basic_models.BigIntegerField(
        default=0,
        verbose_name='минимальная зп 1'
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
        if int(self.min_from or 0) + int(self.min_to or 0) + int(self.min_one or 0) == 0:
            return 0
        else:
            arr = filter(lambda x: int(x or 0)>0, [self.min_from, self.min_to, self.min_one])
            return min(arr)

