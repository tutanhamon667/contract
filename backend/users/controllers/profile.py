from django.http import HttpResponse
from django.shortcuts import render, redirect

from users.models.user import CustomerProfile, WorkerProfile, Resume, Contact, Job, Member
from users.forms import ResumeForm, ContactForm, CustomerForm, WorkerForm


def resume_view(request, resume_id):
    if request.user.is_authenticated:
        user = request.user
        print(user)
        error = None
        if request.method == "GET":
            resume = Resume.objects.get(user=user.id, id=resume_id)
            if resume:
                resume_form = ResumeForm(instance=resume)
                return render(request, './blocks/profile/profile_resume.html', {
                    'resume_form': resume_form
                })
            else:
                return HttpResponse(status=404)

        if request.method == "POST":
            resume = Resume.objects.get(user=user.id, id=resume_id)
            resume_form = ResumeForm(request.POST, instance=resume)
            user_id = int(request.POST.get('user'))
            if user_id != user.id:
                print('fuck off wrong user')
                return HttpResponse(status=503)
            else:
                if resume_form.is_valid():
                    resume_form.save()
                    return redirect(to='profile_resume')
                return render(request, './blocks/profile/profile_resume.html', {
                    'resume_form': resume_form
                })
    else:
        return redirect(to="login")

def resumes_view(request):
    def resume_page(new_resume_form, user):
        resumes = Resume.objects.filter(user=user.id)
        return render(request, './blocks/profile/profile_resumes.html',
                      {'resumes': resumes,
                       'new_resume_form': new_resume_form
                       })

    if request.user.is_authenticated:
        user = request.user
        if request.method == 'POST':
            id = request.POST.get("id", None)
            if id is not None:
                try:
                    if not Resume.is_current_user(id, user):
                        print('fuck off wrong user')
                        return HttpResponse(status=503)
                    else:
                        resume_form = ResumeForm(request.POST)
                        if resume_form.is_valid():
                            resume_form.save()
                        return resume_page(resume_form, user)
                except Exception as e:
                    print(e)
            else:
                try:
                    resume_form = ResumeForm(request.POST)
                    user_id = int(request.POST.get('user'))
                    if user_id != user.id:
                        print('fuck off wrong user')
                        return HttpResponse(status=503)
                    else:
                        if resume_form.is_valid():
                            resume_form.save()
                        return resume_page(resume_form, user)
                except Exception as e:
                    print(e)

        if request.method == "GET":
            new_resume_form = ResumeForm(initial={'user': user.id})
            resumes = Resume.objects.filter(user=user.id)
            return render(request, './blocks/profile/profile_resumes.html',
                          {'resumes': resumes,
                           'new_resume_form': new_resume_form
                           })
    else:
        return redirect(to="login")


def contact_view(request, contact_id):
    if request.user.is_authenticated:
        user = request.user
        print(user)
        error = None
        if request.method == "GET":
            contact = Contact.objects.get(user=user.id, id=contact_id)
            if contact:
                form = ContactForm(instance=contact)
                return render(request, './blocks/profile/profile_contact.html', {
                    'form': form
                })
            else:
                return HttpResponse(status=404)

        if request.method == "POST":
            contact = Contact.objects.get(user=user.id, id=contact_id)
            form = ContactForm(request.POST, instance=contact)
            user_id = int(request.POST.get('user'))
            if user_id != user.id:
                print('fuck off wrong user')
                return HttpResponse(status=503)
            else:
                if form.is_valid():
                    form.save()
                    return redirect(to='profile_contacts')
                return render(request, './blocks/profile/profile_contact.html', {
                    'form': form
                })
    else:
        return redirect(to="login")


def contacts_view(request):
    def contact_page(new_entity_form, user):
        contacts = Contact.objects.filter(user=user.id)
        return render(request, './blocks/profile/profile_contacts.html',
                      {'contacts': contacts,
                       'new_entity_form': new_entity_form
                       })

    if request.user.is_authenticated:
        user = request.user
        if request.method == 'POST':
            id = request.POST.get("id", None)
            if id is not None:
                try:
                    if not Contact.is_current_user(id, user):
                        print('fuck off wrong user')
                        return HttpResponse(status=503)
                    else:
                        form = ContactForm(request.POST)
                        if form.is_valid():
                            form.save()
                            return redirect(to='profile_contacts')
                        return contact_page(form, user)
                except Exception as e:
                    print(e)
            else:
                try:
                    form = ContactForm(request.POST)
                    user_id = int(request.POST.get('user'))
                    if user_id != user.id:
                        print('fuck off wrong user')
                        return HttpResponse(status=503)
                    else:
                        if form.is_valid():
                            form.save()
                            return redirect(to='profile_contacts')
                        return contact_page(form, user)
                except Exception as e:
                    print(e)

        if request.method == "GET":
            new_entity_form = ContactForm(initial={'user': user.id})
            return contact_page(new_entity_form, user)
    else:
        return redirect(to="login")

def profile_main_view(request):
    if request.user.is_authenticated:
        user = request.user
        print(user)
        error = None
        if request.method == "GET":
            member = Member.objects.get(id=user.id)
            form = None
            if member.is_customer:
                customer = CustomerProfile.objects.get(user=user.id)
                form = CustomerForm(instance=customer)
            if member.is_worker:
                worker = WorkerProfile.objects.get(user=user.id)
                form = WorkerForm(instance=worker)
            if form:
                return render(request, './blocks/profile/profile_main.html', {
                    'form': form
                })
            else:
                return HttpResponse(status=404)

        if request.method == "POST":
            form = None
            if 'company_name' in request.POST:
                customer = CustomerProfile.objects.get(user=user.id)
                form = CustomerForm(request.POST, instance=customer)
            else:
                worker = WorkerProfile.objects.get(user=user.id)
                form = WorkerForm(request.POST, instance=worker)
            user_id = int(request.POST.get('user'))
            if user_id != user.id:
                print('fuck off wrong user')
                return HttpResponse(status=503)
            else:
                if form.is_valid():
                    form.save()
                    return redirect(to='profile_main')
                return render(request, './blocks/profile/profile_main.html', {
                    'form': form
                })
    else:
        return redirect(to="login")