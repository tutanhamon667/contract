from django.http import HttpResponse
from django.shortcuts import render, redirect

from common.models import Article, ArticleCategory
from users.core.access import Access
from users.models.user import Company, Member, Resume, Contact, Job
from users.forms import JobForm

