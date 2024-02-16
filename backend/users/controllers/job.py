from django.http import HttpResponse
from django.shortcuts import render, redirect

from users.models.user import CustomerProfile, WorkerProfile, Resume, Contact, Job
from users.forms import ResumeForm, ContactForm, JobForm


def job_view(request, job_id):
    if request.user.is_authenticated:
        user = request.user
        print(user)
        error = None
        if request.method == "GET":
            job = Job.objects.get(customer=user.id, id=job_id)
            if job:
                form = JobForm(instance=job)
                return render(request, './blocks/profile/profile_job.html', {
                    'form': form
                })
            else:
                return HttpResponse(status=404)

        if request.method == "POST":
            job = Job.objects.get(customer=user.id, id=job_id)
            form = JobForm(request.POST, instance=job)
            user_id = int(request.POST.get('user'))
            if user_id != user.id:
                print('fuck off wrong user')
                return HttpResponse(status=503)
            else:
                if form.is_valid():
                    form.save()
                    return redirect(to='profile_jobs')
                return render(request, './blocks/profile/profile_job.html', {
                    'form': form
                })
    else:
        return redirect(to="login")


def jobs_view(request):
    def get_page(form, user):
        if request.user.is_authenticated:
            jobs = Job.objects.filter(customer=user.id)
            return render(request, './blocks/profile/profile_jobs.html',
                          {'jobs': jobs,
                           'form': form
                           })
        else:
            return redirect(to="login")

    if request.user.is_authenticated:
        user = request.user
        if request.method == 'POST':
            id = request.POST.get("id", None)
            if id is not None:
                try:
                    if not Job.is_current_user(id, user):
                        print('fuck off wrong user')
                        return HttpResponse(status=503)
                    else:
                        form = JobForm(request.POST)
                        if form.is_valid():
                            form.save()
                            return redirect(to='profile_jobs')
                        return get_page(form, user)
                except Exception as e:
                    print(e)
            else:
                try:
                    form = JobForm(request.POST)
                    user_id = int(request.POST.get('customer'))
                    if user_id != user.id:
                        print('fuck off wrong user')
                        return HttpResponse(status=503)
                    else:
                        if form.is_valid():
                            form.save()
                            return redirect(to='profile_jobs')
                        return get_page(form, user)
                except Exception as e:
                    print(e)

        if request.method == "GET":

            new_entity_form = JobForm(initial={'customer': user.id})
            return get_page(new_entity_form, user)

    else:
        return redirect(to="signin")

