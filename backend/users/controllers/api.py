import json
from rest_framework import generics
from django.core import serializers
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse

from btc.libs.balance import Balance
from btc.libs.btc_wallet import get_wallet, get_addresses_count, generate_address
from btc.models import JobPayment
from chat.models import Chat
from common.models import ArticleCategory, Article
from orders.models import JobSpecialisationStat
from btc.models import Address as WalletAddress, CustomerAccessPayment, Operation, Address
from users.core.access import Access
from users.forms import CompanyReviewForm, WorkerReviewForm
from users.models.advertise import Banners
from users.models.user import FavoriteJob, Job, ResponseInvite, CustomerReview, Company, Resume, Contact

from django.core.serializers.json import DjangoJSONEncoder


def get_user(request):
    try:
        user = request.user
        photo = None
        if user.is_authenticated:
            if user.photo:
                photo = user.photo.url
            user = {"id": user.id,
                    "display_name": user.display_name,
                    "is_worker": user.is_worker,
                    "is_customer": user.is_customer,
                    "photo": photo}
        else:
            user = {"id": -1, "display_name": None,
                    "is_worker": None,
                    "is_customer": None,
                    "photo": None}
        return JsonResponse({'success': True, 'data': user})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_counters(request):
    try:
        if request.user.is_authenticated:
            if request.user.is_worker:
                not_viewed_response_invites = list(ResponseInvite.objects.filter(resume__user=request.user, viewed_by_worker=False).values())
            else:
                not_viewed_response_invites = list(
                    ResponseInvite.objects.filter(job__company__user=request.user, viewed_by_customer=False).values())
            data = {}
            data["ri"] = not_viewed_response_invites
            return JsonResponse({'success': True, 'data': data})
        else:
            return JsonResponse({'success': False, "code": 401})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_responses_invites(request):
    try:
        if request.user.is_authenticated:
            page = None
            limit = None
            type = None
            status = None
            order = None
            if "page" in request.POST:
                page = int(request.POST["page"])
            if "limit" in request.POST:
                limit = int(request.POST["limit"])
            if "type" in request.POST and request.POST["type"] :
                type = int(request.POST["type"])
            if "status" in request.POST:
                status = int(request.POST["status"])
            if "order" in request.POST:
                order = request.POST["order"]
            count = 0
            ris, count = ResponseInvite.filter_search(user=request.user, order=order, type=type, status=status,page=page, limit=limit)
            if request.user.is_worker:
                for ri in ris:
                    ResponseInvite.objects.filter(id=ri.id).update(viewed_by_worker=True)
            else:
                for ri in ris:
                    ResponseInvite.objects.filter(id=ri.id).update(viewed_by_customer=True)
            res = []
            for ri in ris:


                obj = model_to_dict(ri)
                obj["chat"] = {}
                obj["create_date"] = ri.create_date
                obj["job"] = model_to_dict(ri.job,["title", "id"] )
                obj["worker"] = model_to_dict(ri.resume.user, ["id", "display_name"])
                obj["resume"] = model_to_dict(ri.resume, ["id", "name"])
                obj["company"] = model_to_dict(ri.job.company, ["id", "name"])
                if ri.status == 1:
                    chat = Chat.objects.get(response_invite_id=obj["id"])
                    obj["chat"] = {"uuid": str(chat.uuid)}
                res.append(obj)

            return JsonResponse({'success': True, "data": res, "count": count})
        else:
            return JsonResponse({'success': False, "code": 401})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def favorite_job(request):
    try:
        if request.user.is_authenticated:
            if request.user.is_worker:
                job_id = int(request.POST["job_id"])
                favorite_job = FavoriteJob.objects.filter(user=request.user, job_id=job_id)
                if len(favorite_job) == 0:
                    favorite_job = FavoriteJob(job_id=job_id, user=request.user)
                    favorite_job.save()
                elif len(favorite_job) == 1:
                    favorite_job[0].delete()
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, "code": 403})
        else:
            return JsonResponse({'success': False, "code": 401})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_favorite_jobs(request):
    try:
        if request.user.is_authenticated:
            if request.user.is_worker:
                job_ids = request.POST["job_ids"]
                if not job_ids or len(job_ids) == 0:
                    favorite_jobs = list(FavoriteJob.objects.filter(user=request.user).values())
                else:
                    favorite_jobs = list(FavoriteJob.objects.filter(user=request.user, job_id__in=job_ids).values())
                return JsonResponse({'success': True, "data": favorite_jobs})
            else:
                return JsonResponse({'success': False, "code": 403})
        else:
            return JsonResponse({'success': False, "code": 401})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_hot_jobs(request):
    try:
        hot_jobs = list(Job.get_hot_jobs(3).values())
        return JsonResponse({'success': True, "data": hot_jobs})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def create_review(request):
    if request.user.is_authenticated:
        print(request.POST)
        review_form = CompanyReviewForm(request.POST)
        if review_form.is_valid():
            review = CustomerReview(reviewer=request.user, moderated=False,
                                    company_id=review_form.cleaned_data.get("company_id")
                                    , rating=review_form.cleaned_data.get("rating")
                                    , comment=review_form.cleaned_data.get("comment"))
            review.save()
            return JsonResponse({'success': True, "data": {} })
        else:
            return JsonResponse({'success': False, "data": review_form.errors, "code": 400})
    else:
        return JsonResponse({'success': False, "data": {}, 'code': 403})

def create_worker_review(request):
    user = request.user
    if user.is_authenticated and user.is_customer:
        print(request.POST)
        review_form = WorkerReviewForm(request.POST)
        if review_form.is_valid():
            resume = Resume.objects.get(id=review_form.cleaned_data.get("resume_id"))
            review = CustomerReview(reviewer=request.user, moderated=False,
                                    worker_id=resume.user.id
                                    , rating=review_form.cleaned_data.get("rating")
                                    , comment=review_form.cleaned_data.get("comment"))
            review.save()
            return JsonResponse({'success': True, "data": {} })
        else:
            return JsonResponse({'success': False, "data": review_form.errors, "code": 400})
    else:
        return JsonResponse({'success': False, "data": {}, 'code': 403})


def worker_reviews(request):
    try:
        id = request.POST["resume_id"]
        page = None
        limit = None
        if "page" in request.POST:
            page = int(request.POST["page"])
        if "limit" in request.POST:
            limit = int(request.POST["limit"])
        resume = Resume.objects.get(id=id)
        if page is not None and limit is not None:
            count, reviews = CustomerReview.get_worker_reviews(user_id=resume.user.id, moderated=True, page=page, limit=limit)
        else:
            count, reviews = CustomerReview.get_worker_reviews(user_id=resume.user.id, moderated=True)

        reviews_array = []
        for review in reviews:
            reviews_array.append(
                {"comment": review.comment, "id": review.id, "pub_date": review.pub_date, "rating": review.rating,
                 "reviewer": review.reviewer.company.name})

        return JsonResponse({'success': True, "data": reviews_array, "count": count})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_categories_jobs(request):
    try:
        categories_stat = list(JobSpecialisationStat.objects.all().values())
        return JsonResponse({'success': True, "data": categories_stat})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_best_customers(request):
    try:
        best_customers = list(CustomerReview.get_top_companies(4).values())
        return JsonResponse({'success': True, "data": best_customers})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_banners(request):
    try:
        banners = list(Banners.objects.all().values())
        return JsonResponse({'success': True, "data": banners})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_new_jobs(request):
    try:
        new_jobs = list(Job.get_new_jobs(3).values())
        return JsonResponse({'success': True, "data": new_jobs})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def response_invite(request):
    try:
        user = request.user
        access = Access(user)

        action = request.POST["action"]

        ri_id = request.POST["id"]
        code = 403
        if action == 'create':
            if user.is_worker:
                resume_id = request.POST["resume_id"]
                code = access.check_access("response_invite", resume_id, action)
            if user.is_customer:
                job_id = request.POST["job_id"]
                code = access.check_access("response_invite", job_id, action)
        if action != 'create':
            if user.is_worker:
                code = access.check_access("response_invite", ri_id, 'update')
            if user.is_customer:
                code = access.check_access("response_invite", ri_id, 'update')

        if code != 200:
            if code == 401:
                return JsonResponse({'success': False, "code": code, "msg": "unauth"})
            elif code == 403:
                return JsonResponse({'success': True, "code": code, "msg": "not allowed"})
            else:
                return JsonResponse({'success': False, "code": code})
        status = 0
        res = {}
        response = None
        if action == 'create':
            resume_id = request.POST["resume_id"]
            job_id = request.POST["job_id"]
            if user.is_worker:
                response = ResponseInvite.create_response(user, job_id, resume_id)
            if user.is_customer:
                response = ResponseInvite.create_invite(user, job_id, resume_id)
        elif action == 'accept':
            status = 1
        elif action == 'decline':
            status = 2
        elif action == 'delete':
            status = 3
        if action != 'create':
            response = ResponseInvite.update_response_invite(ri_id, user, status)
        if action == 'accept':
            if user.is_worker:
                chat = Chat(customer=response.job.company.user, worker=user, response_invite=response)
                chat.save()
            if user.is_customer:
                chat = Chat(customer=user, worker=response.resume.user, response_invite=response)
                chat.save()
        if action == 'decline':
            chat = Chat.objects.get(response_invite=response)
            if user.is_worker:
                chat.deleted_by_worker = True
            else:
                chat.deleted_by_customer = True
            chat.save()
        if action == 'delete':
            ri = ResponseInvite.objects.get(id=ri_id)
            if user.is_worker:
                ri.deleted_by_worker = True
            else:
                ri.deleted_by_customer = True
            ri.save()
            if ri.deleted_by_customer and ri.deleted_by_worker:
                ri.set_deleted()
        res["id"] = response.id
        res["job_id"] = int(response.job_id)
        res["resume_id"] = int(response.resume_id)
        res["status"] = response.status
        res["type"] = response.type
        return JsonResponse({'success': True, "data": res})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_user_resumes(request):
    try:
        user = request.user
        access = Access(user)
        code = access.check_access("self_resumes")
        if code != 200:
            if code == 401:
                return JsonResponse({'success': False, "code": code, "msg": "unauth"})
            elif code == 403:
                return JsonResponse({'success': True, "code": code, "msg": "not allowed"})
            else:
                return JsonResponse({'success': False, "code": code})
        resumes = list(Resume.objects.filter(user=user, deleted=False).values())
        return JsonResponse({'success': True, "data": resumes})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def favorite_jobs(request):
    try:
        if request.user.is_authenticated:

            jobs = Job.objects.filter(favoritejob__user_id=request.user, deleted=False)
            companies = Company.join_companies(jobs)
            res = list(jobs.values())
            payments = list(JobPayment.join_tier(objs=jobs).values())
            companies_arr = []
            for company in companies:
                logo = None
                if company["logo"]:
                    logo = company["logo"]
                companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"]})
            invites = []
            favorites = []
            if request.user.is_authenticated:
                invites = list(ResponseInvite.join_invites(objs=jobs, user=request.user).values())
                if request.user.is_worker:
                    favorites = list(FavoriteJob.join_favorites(objs=jobs, user=request.user).values())

            for r in res:
                r["company"] = {}
                for company in companies_arr:
                    if company["id"] == r["company_id"]:
                        r["company"] = company
                r["invite"] = {}
                for invite in invites:
                    if r["id"] == invite["job_id"]:
                        if invite["status"] == 1:
                            try:
                                chat = Chat.objects.get(response_invite_id=invite["id"])
                                invite["chat"] = {"uuid": chat.uuid}

                            except Exception as e:
                                print(e)
                        r["invite"] = invite
                for payment in payments:
                    if r["id"] == payment["job_id"]:
                        r["payment"] = payment
                r["favorite"] = {}
                for favorite in favorites:
                    if r["id"] == favorite["job_id"]:
                        favorite["checked"] = True
                        r["favorite"] = favorite
            return JsonResponse({'success': True, "data": res})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})



def filter_resumes(request):
    try:
        user = request.user
        access = Access(user)
        code = access.check_access("resume")
        if code != 200:
            return JsonResponse({'success': False, "code": code})
        resumes_count, resumes = Resume.search_filter(request)
        res = list(resumes.values())
        for resume in res:
            item_regions = None
            for resume_db in resumes:
                if resume_db.id == resume["id"]:
                    resume["display_name"] = resume_db.user.display_name
                    item_regions = resume_db.region
                    if resume_db.user.photo:
                        resume["photo"] = resume_db.user.photo.url
                    else:
                        resume["photo"] = None
            if item_regions:
                resume["regions"] = list(item_regions.values())
            else:
                resume["regions"] = []

        invites = []
        if request.user.is_authenticated:
            invites = list(ResponseInvite.join_responses(objs=resumes, user=request.user).values())

        for r in res:
            r["invite"] = {}
            for invite in invites:
                if r["id"] == invite["resume_id"]:
                    if invite["status"] == 1:
                        try:
                            chat = Chat.objects.get(response_invite_id=invite["id"])
                            invite["chat"] = {"uuid": chat.uuid}

                        except Exception as e:
                            print(e)
                    r["invite"] = invite

        return JsonResponse({'success': True, "data": res, "count": resumes_count})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_jobs(request):
    try:
        jobs_count, jobs = Job.search_filter_new(request)
        companies = Company.join_companies(jobs)
        res = list(jobs.values())
        for job in res:
            item_regions = None
            for job_db in jobs:
                if job_db.id == job["id"]:
                    item_regions = job_db.region
            job["regions"] = list(item_regions.values())
        payments = list(JobPayment.join_tier(objs=jobs).values())
        companies_arr = []
        for company in companies:
            logo = None
            if company["logo"]:
                logo = company["logo"]
            companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"]})
        invites = []
        favorites = []
        if request.user.is_authenticated:
            invites = list(ResponseInvite.join_invites(objs=jobs, user=request.user).values())
            if request.user.is_worker:
                favorites = list(FavoriteJob.join_favorites(objs=jobs, user=request.user).values())

        for r in res:
            r["company"] = {}
            for company in companies_arr:
                if company["id"] == r["company_id"]:
                    r["company"] = company
            r["invite"] = {}
            for invite in invites:
                if r["id"] == invite["job_id"]:
                    if invite["status"] == 1:
                        try:
                            chat = Chat.objects.get(response_invite_id=invite["id"])
                            invite["chat"] = {"uuid": chat.uuid}

                        except Exception as e:
                            print(e)
                    r["invite"] = invite
            for payment in payments:
                if r["id"] == payment["job_id"]:
                    r["payment"] = payment
            r["favorite"] = {}
            for favorite in favorites:
                if r["id"] == favorite["job_id"]:
                    favorite["checked"] = True
                    r["favorite"] = favorite
        return JsonResponse({'success': True, "data": res, "count": jobs_count})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_job(request):
    try:
        jobs = Job.get_paid_job(request.POST["id"])
        res = list(jobs.values())
        companies = Company.join_companies(jobs)

        for job in res:
            item_regions = None
            for job_db in jobs:
                if job_db.id == job["id"]:
                    item_regions = job_db.region
            job["regions"] = list(item_regions.values())
        payments = list(JobPayment.join_tier(objs=jobs).values())
        companies_arr = []
        for company in companies:
            logo = None
            if company["logo"]:
                logo = company["logo"]
            companies_arr.append({"id": company["id"], "logo": logo, "name": company["name"]})
        invites = []
        favorites = []
        if request.user.is_authenticated:
            invites = list(ResponseInvite.join_invites(objs=jobs, user=request.user).values())
            if request.user.is_worker:
                favorites = list(FavoriteJob.join_favorites(objs=jobs, user=request.user).values())

        for r in res:
            r["company"] = {}
            for company in companies_arr:
                if company["id"] == r["company_id"]:
                    r["company"] = company
            r["invite"] = {}
            for invite in invites:
                if r["id"] == invite["job_id"]:
                    if invite["status"] == 1:
                        try:
                            chat = Chat.objects.get(response_invite_id=invite["id"])
                            invite["chat"] = {"uuid": chat.uuid}

                        except Exception as e:
                            print(e)
                    r["invite"] = invite
            for payment in payments:
                if r["id"] == payment["job_id"]:
                    r["payment"] = payment
            r["favorite"] = {}
            for favorite in favorites:
                if r["id"] == favorite["job_id"]:
                    favorite["checked"] = True
                    r["favorite"] = favorite
        res = res[0]
        contacts = list(Contact.get_company_contacts(res["company"]["id"]))
        res["contacts"] = contacts
        rating = CustomerReview.get_company_rating(res["company"]["id"])
        reviews = list(CustomerReview.objects.filter(company_id=res["company"]["id"]).values())
        res["company"]["rating"] = rating
        res["company"]["reviews"] = len(reviews)
        return JsonResponse({'success': True, "data": res})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_company(request):
    try:
        id = request.POST["id"]
        company = list(Company.get_active_company(id).values())[0]
        rating = CustomerReview.get_company_rating(company["id"])
        reviews = list(CustomerReview.objects.filter(company_id=company["id"]))
        contacts = list(Contact.get_company_contacts(company["id"]))
        company["contacts"] = contacts
        company["rating"] = rating
        company["reviews"] = len(reviews)
        return JsonResponse({'success': True, "data": company})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_resume_statistics(request):
    try:
        user = request.user
        access = Access(user)
        code = access.check_access("resume")
        if code != 200:
            return JsonResponse({'success': False, "code": code})
        result = {}
        resume_id = request.POST["id"]
        resume = Resume.objects.get(id=resume_id)
        worker = resume.user
        result["created_at"] = worker.created_at
        responses = list(ResponseInvite.get_resume_responses(resume_id).values())
        invites = list(ResponseInvite.get_resume_invites(resume_id).values())
        result["invites"] = invites
        result["responses"] = responses
        return JsonResponse({'success': True, "data": result})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})




def get_contacts(request):
    try:
        user = request.user
        access = Access(user)
        code = access.check_access("self_contacts")
        if code != 200:
            return JsonResponse({'success': False, "code": code})
        if request.user.is_customer:
            contacts = list(Contact.get_company_contacts(request.user.id))
        else:
            contacts = list(Contact.get_worker_contacts(request.user.id))
        return JsonResponse({'success': True, "data": contacts})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})

def get_resume(request):
    try:
        user = request.user
        access = Access(user)
        id = request.POST["id"]
        code = access.check_access("resume",id )
        if code != 200:
            return JsonResponse({'success': False, "code": code})
       
        resume = Resume.get_active_resume(id)
        resume_obj = list(resume.values())[0]
        reviews = list(CustomerReview.objects.filter(worker_id=resume[0].user.id))
        contacts = list(Contact.get_worker_contacts(resume[0].user.id))
        resume_obj["contacts"] = contacts
        resume_obj["photo"] = resume[0].user.photo.url
        resume_obj["display_name"] = resume[0].user.display_name
        resume_obj["reviews"] = len(reviews)
        invites = list(ResponseInvite.join_responses(objs=resume, user=request.user).values())
        item_regions = resume[0].region

        if item_regions:
            resume_obj["regions"] = list(item_regions.values())
        else:
            resume_obj["regions"] = []

        resume_obj["invite"] = {}
        for invite in invites:
            if resume_obj["id"] == invite["resume_id"]:
                if invite["status"] == 1:
                    try:
                        chat = Chat.objects.get(response_invite_id=invite["id"])
                        invite["chat"] = {"uuid": chat.uuid}
                    except Exception as e:
                        print(e)
                resume_obj["invite"] = invite

        return JsonResponse({'success': True, "data": resume_obj})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def company_reviews(request):
    try:
        id = request.POST["company_id"]
        page = None
        limit = None
        if "page" in request.POST:
            page = int(request.POST["page"])
        if "limit" in request.POST:
            limit = int(request.POST["limit"])
        if page is not None and limit is not None:
            count, reviews = CustomerReview.get_company_reviews(company_id=id, moderated=True, page=page, limit=limit)
        else:
            count, reviews = CustomerReview.get_company_reviews(company_id=id, moderated=True)

        reviews_array = []
        for review in reviews:
            reviews_array.append({"comment":review.comment, "id":review.id, "pub_date":review.pub_date, "rating":review.rating,
                                  "reviewer":review.reviewer.display_name})

        return JsonResponse({'success': True, "data": reviews_array, "count": count})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_menu(request):
    try:
        articles = list(Article.objects.all().values())
        categories = list(ArticleCategory.objects.all().values())
        return JsonResponse({'success': True, "data": {"articles": articles, "categoriest": categories}})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})


def get_balance(request):
    try:
        if request.user.is_authenticated:
            if request.user.is_customer:
                address = WalletAddress.objects.filter(user=request.user.id)
                if len(address) > 0:
                    profile_address = address[0]
                else:
                    wallet = get_wallet()
                    addresses_count = get_addresses_count(wallet)
                    address = generate_address(addresses_count + 1, wallet.mnemonic)
                    profile_address = WalletAddress(address=address["address"], wif=address["wif"],
                                                    key_id=address["key_id"], wallet=wallet, user=request.user)
                    profile_address.save()
                operations = Operation.objects.filter(address=profile_address)
                balance = Balance(profile_address, operations)
                return JsonResponse({'success': True, "data": {"usd": balance.get_final_balance_usd,
                                                               "btc": round(balance.get_final_balance_btc, 8)}})
            else:
                return JsonResponse({'success': False, "code": 403})
        else:
            return JsonResponse({'success': False, "code": 401})
    except Exception as e:
        return JsonResponse({'success': False, "code": 500, "msg": str(e)})
