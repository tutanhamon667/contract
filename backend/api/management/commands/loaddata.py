import csv
import os

from django.conf import settings
from django.core.management import BaseCommand

from orders.models import JobCategory

path = f'{settings.BASE_DIR}/data/'
os.chdir(path)


class Command(BaseCommand):
    def handle(self, *args, **options):

        with open('jobcategory.csv') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                obj = JobCategory(
                    id=row['id'],
                    name=row['name'],
                    slug=row['slug']
                )
                obj.save()

        self.stdout.write(
            self.style.SUCCESS("Данные загружены."))
