from django.shortcuts import render


def not_found_handler(request, exception=None):
	return render(request, './404.html', {})


def internal_error_handler(request, exception=None):
	return render(request, './404.html', {})