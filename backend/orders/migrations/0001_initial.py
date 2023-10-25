# Generated by Django 4.2.5 on 2023-10-25 08:08

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='Название задания')),
                ('description', models.TextField(verbose_name='Описание задания')),
                ('budget', models.PositiveIntegerField(blank=True, help_text='Укажите сумму в рублях или выберете "Жду предложений"', null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Бюджет')),
                ('ask_budget', models.BooleanField(default=False, verbose_name='Запросить бюджет')),
                ('deadline', models.DateTimeField(blank=True, null=True, verbose_name='Срок выполнения или выберете "Жду предложений"')),
                ('ask_deadline', models.BooleanField(default=False, verbose_name='Запросить сроки')),
                ('pub_date', models.DateField(auto_now_add=True, verbose_name='Дата публикации задания')),
            ],
            options={
                'verbose_name': 'Задание',
                'verbose_name_plural': 'Задания',
                'ordering': ('-pub_date',),
            },
        ),
        migrations.CreateModel(
            name='JobCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('design', 'дизайн'), ('development', 'разработка'), ('testing', 'тестирование'), ('administration', 'администрирование'), ('marketing', 'маркетинг'), ('content', 'контент'), ('other', 'разное')], max_length=50, verbose_name='Название специализации')),
                ('slug', models.SlugField(unique=True, verbose_name='Идентификатор специализации')),
            ],
            options={
                'verbose_name': 'Специализация',
                'verbose_name_plural': 'Специализации',
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='StackJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='job', to='orders.job', verbose_name='Задание')),
                ('stack', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stack', to='users.stack', verbose_name='Стэк')),
            ],
            options={
                'verbose_name': 'Стэк технологий',
                'verbose_name_plural': 'Стэк технологий',
            },
        ),
        migrations.CreateModel(
            name='JobFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.ImageField(upload_to='orders/job_files')),
                ('name', models.CharField(max_length=255)),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='orders/job_files/thumbnails/')),
                ('job', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='job_files', to='orders.job')),
            ],
            options={
                'verbose_name': 'Файл задания',
                'verbose_name_plural': 'Файлы задания',
            },
        ),
        migrations.AddField(
            model_name='job',
            name='category',
            field=models.ManyToManyField(help_text='Выберите специализацию', related_name='jobs', to='orders.jobcategory', verbose_name='Специализация'),
        ),
        migrations.AddField(
            model_name='job',
            name='client',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='jobs', to='users.customerprofile', verbose_name='Заказчик'),
        ),
        migrations.AddField(
            model_name='job',
            name='stack',
            field=models.ManyToManyField(help_text='Укажите стек технологий', related_name='jobs', through='orders.StackJob', to='users.stack', verbose_name='Стек технологий'),
        ),
        migrations.CreateModel(
            name='JobResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('freelancer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='users.workerprofile')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='orders.job')),
            ],
            options={
                'verbose_name': 'Отклик',
                'verbose_name_plural': 'Отклики',
                'unique_together': {('freelancer', 'job')},
            },
        ),
    ]
