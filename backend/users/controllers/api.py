from django.http import HttpResponse, JsonResponse


def favorite_job(request):
	if request.is_authenticated:
		return JsonResponse({'success': True})
	else:
		return JsonResponse({'success': False})