from django.shortcuts import render

from common.models import Article, ArticleCategory


# Create your views here.


def article_view(request, article_id):
	article = Article.objects.get(id=article_id)
	articles = Article.objects.all()
	categories = ArticleCategory.objects.all()
	return render(request, './pages/article.html', {
		'article': article,
		'categories': categories,
		'articles': articles
	})