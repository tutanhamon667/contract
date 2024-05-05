const alpineApp = function () {

    Alpine.bind('PasswordToggleBtn', {
        type: 'button',
        showPassword: false,
        '@click'(e) {
            this.showPassword = !this.showPassword
            e.currentTarget.classList.toggle('hidepassword')
            const input = e.currentTarget.closest('div').querySelector('input')
            if (this.showPassword) {
                input.setAttribute('type', 'text')
            } else {
                input.setAttribute('type', 'password')
            }

        },
    })

    Alpine.bind('hideRegionsBtn', {
        type: 'span',
        show: false,
        '@click'(e) {
            this.show = !this.show
            const span = e.currentTarget.closest('.hide-container').querySelector('.hide-content')
            span.classList.toggle('hidden')
        },
    })


    const makeRequest = async function (url, data) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/${url}`,
                data: data,
                beforeSend: function (request) {
                    request.setRequestHeader("X-CSRFToken", csrftoken);
                },
                method: "POST",
                success: (data) => {
                    resolve(data)
                },
                error: (error) => {
                    reject(error)
                }
            })
        })

    }

    function numberWithSpace(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    Alpine.store('main', {
        jobs: [],
        job: null,
        user: {},
        jobCount: 0,
        selectedResume: null,
        selectedJob: null,
        balance: "",
        resumes: [],
        filters: {page: 0, limit: 3},
        reviews_filters: {page: 0, limit: 3},
        pagination: [],
        reviews_pagination: [],
        getWorkExpString: (value, needExpWord = true) => {
            switch (value) {
                case 'WithoutExperience':
                    return 'Без опыта'
                case 'NoMatter':
                    return 'Без опыта'
                case 'Between1And6':
                    return needExpWord ? 'Опыт От 1 до 6 месяцев' : 'От 1 до 6 месяцев'
                case 'Between6And12':
                    return needExpWord ? 'Опыт От 6 месяцев до 1 года' : 'От 6 месяцев до 1 года'
                case 'Between12And24':
                    return needExpWord ? 'Опыт От 1 до 2 лет' : 'От 1 до 2 лет'
                case 'More24':
                    return needExpWord ? 'Опыт От 2 лет' : 'От 2 лет'

            }
        },
        getWorkTimeString: (value) => {
            switch (value) {
                case true:
                    return 'Полный день'
                case false:
                    return 'Гибкий график'

            }
        },
        createPaginationArray: (count, filters) => {
            const arrayLength = Math.ceil(count / filters.limit)
            let pagination = new Array(arrayLength)
            const iterator = pagination.keys();

            for (const key of iterator) {
                pagination[key] = {text: key, active: filters.page === key}
            }
            return pagination
        },
        getRegionsStr: (job, hide_many = true) => {
            if (!job.is_offline) {
                if (hide_many) {
                    if (job.regions.length > 3) {
                        const length = job.regions.length - 3
                        const regions_to_display = job.regions.slice(0, 3)
                        const regions_to_hide = job.regions.splice(3)
                        let region_names = regions_to_display.map(i => i.name).join(', ')
                        let region_names_display = regions_to_hide.map(i => i.name).join(', ')
                        return 'Оффлайн занятость: ' + region_names + ' <span class="hide-container"><span class="hide-btn  work-type"   x-bind="hideRegionsBtn">и ещё ' + length +
                            '</span><span class="hide-content hidden  work-type">: ' + region_names_display + '</span></span>'
                    } else {
                        let region_names = job.regions.map(i => i.name).join(', ')
                        return 'Оффлайн занятость: ' + region_names
                    }
                }
                let region_names = job.regions.map(i => i.name).join(', ')
                return 'Оффлайн занятость: ' + region_names
            } else {
                return 'Онлайн занятость'
            }
        },
        getDepositStr: (job) => {
            if (!job.deposit) {
                return 'Без залога'
            } else {
                return `Залог: ${numberWithSpace(job.deposit)} ₽`
            }
        },

        getResumeSalaryStr: (job) => {
            if (!job.salary) {
                return "Не указана"
            }
            return numberWithSpace(job.salary) + " ₽"
        },

        getSalaryStr: (job) => {

            if (!job.salary_from && !job.salary_to) {
                return "Не указана"
            }

            if (job.salary_from === job.salary_to) {
                return numberWithSpace(job.salary_from) + " ₽"
            }
            if (job.salary_from && job.salary_to) {
                return `от ${numberWithSpace(job.salary_from)} до ${numberWithSpace(job.salary_to)}  ₽`
            }
            if (job.salary_from && !job.salary_to) {
                return `от ${numberWithSpace(job.salary_from)} ₽`
            }
            if (!job.salary_from && job.salary_to) {
                return `до ${numberWithSpace(job.salary_to)} ₽`
            }
        },
        getJobs: async (data = {}) => {
            if (typeof data.page === 'undefined')
                data.page = Alpine.store('main').filters.page
            data.limit = Alpine.store('main').filters.limit
            return makeRequest('jobs', data)
        },
        getFavoriteJobs: async (data = {}) => {
            if (typeof data.page === 'undefined')
                data.page = 0
            return makeRequest('favorite_jobs', data)
        },
        setJobs: (data) => {
            Alpine.store('main').jobs = data
        },
        getJob: async (data = {}) => {
            return makeRequest('job', data)
        },
        setJob: (data) => {
            Alpine.store('main').job = data
        },
        sendResponse: async (action, id) => {
            return makeRequest('response_invite', {action: action, id: id})
        },
        getUser: async () => {
            return makeRequest('user', {})
        },
        getBalance: async () => {
            return makeRequest('balance', {})
        },
        setUser: (data) => {
            Alpine.store('main').user = data
        },
        sendResponseInvite: async (action, id, job_id, resume_id) => {
            return makeRequest('response_invite', {action: action, id: id, job_id: job_id, resume_id: resume_id})
        },
        getResumes: async () => {
            return makeRequest('user_resumes', {})
        },
        setResumes: (data) => {
            Alpine.store('main').resumes = data
        },
        setFavorite: async (job_id) => {
            return makeRequest('favorite', {job_id: job_id})
        },
        getResponseInviteElement: (id, singleJob = false) => {
            const user = Alpine.store('main').user
            if (user.id >= 0) {
                let job = !singleJob ? Alpine.store('main').jobs.find(el => el.id === id) : Alpine.store('main').job
                if (job.invite.status === 1) {
                    return {element: 'link', link: '/chat/' + job.invite.chat.uuid, text: 'Перейти в чат'}
                }
                if (job.invite.status === 2) {
                    return {element: 'status', text: 'Отклик отклонён'}
                }
                if (job.invite.status === 3) {
                    return {element: 'status', text: 'Отклик удалён'}
                }
                if (job.invite.status === 0) {
                    if (job.invite.type === 1) {
                        return {
                            element: 'form',
                            text: 'Работодатель вас пригласил на собеседование',
                            actions: [{action: "accept", text: 'Принять приглашение'}, {
                                action: "decline",
                                text: 'Отклонить приглашение'
                            }],
                            id: job.invite.id
                        }
                    }
                    if (job.invite.type === 0) {
                        return {element: 'status', text: 'Ждёт подтверждение от работодателя'}
                    }
                }
                if (typeof job.invite.id === 'undefined') {
                    if (Alpine.store('main').resumes.length) {
                        return {
                            element: 'form',
                            text: '',
                            actions: [{action: "create", text: 'Откликнуться'}],
                            id: null
                        }
                    } else {
                        return {element: 'link', link: '/profile/resume', text: 'Создать резюме для отклика'}
                    }

                }
            }
            return ''
        },


        getResponseInviteStatus: (id) => {
            const user = Alpine.store('main').user
            if (user.id >= 0) {
                const job = Alpine.store('main').jobs.find(el => el.id === id)
                if (job.invite.status === 1) {
                    return 'link'
                }
                if (job.invite.status === 0 || job.invite.status === 2) {
                    return 'text'
                }
                if (typeof job.invite.id === 'undefined') {
                    return 'form'
                }
            }
            return ''
        },

        getResponseInviteResumeElement: (id, singleJob = false) => {
            const user = Alpine.store('main').user
            if (user.id >= 0) {
                let resume = !singleJob ? Alpine.store('main').filtered_resumes.find(el => el.id === id) : Alpine.store('main').resume
                if (resume.invite.status === 1) {
                    return {element: 'link', link: '/chat/' + resume.invite.chat.uuid, text: 'Перейти в чат'}
                }
                if (resume.invite.status === 2) {
                    return {element: 'status', text: 'Отклик отклонён'}
                }
                if (resume.invite.status === 3) {
                    return {element: 'status', text: 'Отклик удалён'}
                }
                if (resume.invite.status === 0) {
                    if (resume.invite.type === 0) {
                        return {
                            element: 'form',
                            text: '',
                            actions: [{action: "accept", text: 'Начать чат с кандидатом'}, {
                                action: "decline",
                                text: 'Отказаться'
                            }],
                            id: resume.invite.id
                        }
                    }
                    if (resume.invite.type === 1) {
                        return {element: 'status', text: 'Ждёт подтверждение от соискателя'}
                    }
                }
                if (typeof resume.invite.id === 'undefined') {
                    if (Alpine.store('main').customerJobs.length) {
                        return {
                            element: 'form',
                            text: 'Выберете вакансию для приглашения',
                            actions: [{action: "create", text: 'Пригласить'}],
                            id: null
                        }
                    } else {
                        return {element: 'link', link: '/profile/jobs', text: 'Создать вакансию для приглашения'}
                    }

                }
            }
            return ''
        },


    })


    Alpine.bind('favorite_checkbox', {
        type: 'checkbox',
        '@click'(e) {
            console.log(this.$ref)
        },
    })
    Alpine.bind('chat_submit_btn', {
        type: 'button',
        '@click'(e) {

        },

    })

    this.createReview = async (el) => {
        const form = document.querySelector('#reviewForm')
        let object = {}
        if (form) {
            const params = new FormData(form);
            params.forEach((value, key) => {
                if (typeof object[key] == 'undefined') {
                    object[key] = value
                } else {
                    if (Array.isArray(object[key])) {
                        object[key].push(value)
                    } else {
                        object[key] = [object[key], value]

                    }
                }
            });
        }
        object["company_id"] = Alpine.store('main').company.id
        const result = await makeRequest('create_review', object)
        if (result.success) {
            const successMsg = document.querySelector("#review-form-success-msg")
            successMsg.innerText = "Спасибо за отзыв, он будет отображаться, после модерации"
        } else {
            const errorMsg = document.querySelector("#review-form-error-msg")
            for (let error in result.data) {
                let div = document.createElement('p');
                div.className = "form-error-msg";
                div.innerText = result.data[error][0];
                document.querySelector(`[name='${error}']`).closest('div').append(div)
            }

        }
        console.log(result)
    }

    this.getJobs = async (filters) => {
        return Alpine.store('main').getJobs(filters)
    }

    this.setJobs = (data) => {
        Alpine.store('main').setJobs(data)
    }

    this.setFilterResumes = (data) => {
        Alpine.store('main').filtered_resumes = data
    }

    this.getJob = async (id) => {
        return makeRequest('job', {id: id})
    }

    this.getCompany = async (id) => {
        return makeRequest('company', {id: id})
    }
    this.getCompanyReviews = async (filters = {}) => {
        Object.assign(filters, Alpine.store('main').reviews_filters)
        return makeRequest('company_reviews', filters)
    }
    this.getReviewsAboutWorker = async (filters = {}) => {
        Object.assign(filters, Alpine.store('main').reviews_filters)
        return makeRequest('worker_reviews', filters)
    }

    this.setJob = (data) => {
        Alpine.store('main').setJob(data)
    }

    this.setResumesCount = (data) => {
        Alpine.store('main').resumesCount = data
    }

    this.setJobsCount = (data) => {
        Alpine.store('main').jobCount = data
    }
    this.setPagination = (data) => {
        Alpine.store('main').pagination = []
        Alpine.store('main').pagination = data
    }
    this.getFavoriteJobs = async () => {
        const jobs = await Alpine.store('main').getFavoriteJobs()
        if (jobs.success) {
            Alpine.store('main').setJobs(jobs.data)
        }
    }

    this.getResumes = async () => {
        return Alpine.store('main').getResumes()
    }

    this.setResumes = (data) => {
        Alpine.store('main').setResumes(data)
        if (data.length) {
            Alpine.store('main').selectedResume = data[0].id
        }
    }
    this.getUser = async () => {
        return Alpine.store('main').getUser()
    }

    this.setUser = (data) => {
        Alpine.store('main').setUser(data)
    }

    this.setFavorite = async (job_id) => {

        const result = await Alpine.store('main').setFavorite(job_id)
        if (result.success === true) {
            this.setJobs([])
            const res = await this.getJobs()
            if (res.success) {
                this.setJobs(res.data)
            } else {
                alert(res.msg)
            }
        }
    }

    this.sendResponse = async (action, id, job_id) => {

        const selectedItem = Alpine.store('main').selectedResume || Alpine.store('main').resumes[0].id
        const result = await Alpine.store('main').sendResponseInvite(action, id, job_id, selectedItem)
        if (result.success === true) {
            let ind = null
            const job = Alpine.store('main').jobs.find((i, index) => {
                if (i.id === job_id) {
                    ind = index
                    return true
                }
                return false
            })
            if (job) {
                let msg = ""
                if (action === "create") {
                    msg = "Ваш отклик успешно отправлен!"
                }
                result.data.msg = msg
                job.invite = result.data

            } else {
                alert(res.msg)
            }
        }
    }

    this.sendInvite = async (action, id, resume_id) => {

        const selectedItem = Alpine.store('main').selectedJob || Alpine.store('main').customerJobs[0].id

        const result = await Alpine.store('main').sendResponseInvite(action, id, resume_id, selectedItem)
        if (result.success === true) {
            let ind = null
            const resume = Alpine.store('main').filtered_resumes.find((i, index) => {
                if (i.id === resume_id) {
                    ind = index
                    return true
                }
                return false
            })
            if (resume) {
                let msg = ""
                if (action === "create") {
                    msg = "Ваш приглашение успешно отправлено!"
                }
                result.data.msg = msg
                resume.invite = result.data

            } else {
                alert(res.msg)
            }
        }
    }

    this.setFavorite = async (job_id) => {
        const result = await Alpine.store('main').setFavorite(job_id)
    }


    this.getResponseInviteElement = () => {

    }
    this.setReviewsPage = async (page) => {
        const object = {
            "page": page,
            limit: Alpine.store('main').reviews_filters.limit,
            company_id: Alpine.store('main').company.id
        };
        Alpine.store('main').reviews_filters = object
        const reviews = await this.getCompanyReviews(object)
        if (reviews.success) {
            Alpine.store('main').reviews = reviews.data
            Alpine.store('main').reviewsCount = reviews.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').reviewsCount, Alpine.store('main').reviews_filters)
            Alpine.store('main').reviews_pagination = pagination
        }
    }

    this.setJobsPage = async (page) => {
        const object = {"page": page, limit: Alpine.store('main').filters.limit};
        const form = document.querySelector('#filter_form')
        if (form) {
            const params = new FormData(form);
            params.forEach((value, key) => {
                if (typeof object[key] == 'undefined') {
                    object[key] = value
                } else {
                    if (Array.isArray(object[key])) {
                        object[key].push(value)
                    } else {
                        object[key] = [object[key], value]

                    }
                }
            });
        }

        Alpine.store('main').filters = object
        const res = await this.getJobs(object)
        if (res.success) {
            this.setJobs(res.data)
            this.setJobsCount(res.count)
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').jobCount, Alpine.store('main').filters)
            this.setPagination(pagination)
        } else {
            alert(res.msg)
        }
    }

    this.setResumesPage = async (page) => {
        const object = {"page": page, limit: Alpine.store('main').filters.limit};
        const form = document.querySelector('#filter_form')
        if (form) {
            const params = new FormData(form);
            params.forEach((value, key) => {
                if (typeof object[key] == 'undefined') {
                    object[key] = value
                } else {
                    if (Array.isArray(object[key])) {
                        object[key].push(value)
                    } else {
                        object[key] = [object[key], value]

                    }
                }
            });
        }

        Alpine.store('main').filters = object
        const res = await makeRequest('filter_resumes', object)
        if (res.success) {
            this.setFilterResumes(res.data)
            this.setResumesCount(res.count)
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').resumesCount, Alpine.store('main').filters)
            this.setPagination(pagination)
        } else {
            alert(res.msg)
        }
    }

    this.filterResumes = async (filters = {}) => {
        Alpine.store('main').filters.page = 0
        let object = {"page": Alpine.store('main').filters.page, limit: Alpine.store('main').filters.limit};
        object = Object.assign(object, filters)
        const form = document.querySelector('#filter_form')
        if (form) {
            const params = new FormData(form);

            params.forEach((value, key) => {
                if (typeof object[key] == 'undefined') {
                    object[key] = value
                } else {
                    if (Array.isArray(object[key])) {
                        object[key].push(value)
                    } else {
                        object[key] = [object[key], value]

                    }
                }
            });
        }

        const res = await makeRequest('filter_resumes', object)
        if (res.success) {
            this.setFilterResumes(res.data)
            this.setResumesCount(res.count)
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').resumesCount, Alpine.store('main').filters)
            this.setPagination(pagination)
        } else {
            alert(res.msg)
        }
    }


    this.filterJobs = async (filters = {}) => {
        Alpine.store('main').filters.page = 0
        let object = {"page": Alpine.store('main').filters.page, limit: Alpine.store('main').filters.limit};
        object = Object.assign(object, filters)
        const form = document.querySelector('#filter_form')
        if (form) {
            const params = new FormData(form);

            params.forEach((value, key) => {
                if (typeof object[key] == 'undefined') {
                    object[key] = value
                } else {
                    if (Array.isArray(object[key])) {
                        object[key].push(value)
                    } else {
                        object[key] = [object[key], value]

                    }
                }
            });
        }

        const res = await this.getJobs(object)
        if (res.success) {
            this.setJobs(res.data)
            this.setJobsCount(res.count)
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').jobCount, Alpine.store('main').filters)
            this.setPagination(pagination)
        } else {
            alert(res.msg)
        }
    }

    this.getBalance = async () => {
        const data = await Alpine.store('main').getBalance()
        if (data.success) {
            Alpine.store('main').balance = data.data.usd + ' $/' + data.data.btc + ' btc'
        }
    }

    this.initFavoriteJobs = async () => {
        const jobs = await this.getFavoriteJobs()
        if (jobs.success) {
            this.setJobs(jobs.data)
        }
    }

    this.getJob = async (id) => {
        const res = await makeRequest('job', {id: id})
        if (res.success) {
            this.setJob(res.data)
        } else {
            alert(res.msg)
        }
    }

    this.getResume = async (id) => {
        const res = await makeRequest('resume', {id: id})
        if (res.success) {
            Alpine.store('main').resume = res.data
        } else {
            alert(res.msg)
        }
    }

    this.initJob = async (id) => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_worker) {
                const resumes = await this.getResumes()
                if (resumes.success) {
                    this.setResumes(resumes.data)
                }
            }
        }

        await this.getJob(id)
    }

    this.initCompany = async (id) => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_worker) {
                const resumes = await this.getResumes()
                if (resumes.success) {
                    this.setResumes(resumes.data)
                }
            }
        }

        const company = await this.getCompany(id)
        if (company.success) {
            Alpine.store('main').company = company.data
        }
        const reviews = await this.getCompanyReviews({company_id: id})
        if (reviews.success) {
            Alpine.store('main').reviews = reviews.data
            Alpine.store('main').reviewsCount = reviews.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').reviewsCount, Alpine.store('main').reviews_filters)
            Alpine.store('main').reviews_pagination = pagination
        }
    }

    this.formatShortDate = (date) => {
        const d = new Date(date);
        return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear()
    }

    this.getJobRatingArray = (rating) => {
        const res = []
        for (let i = 0; i <= 4; i++) {

            if (rating >= 1) res.push(2)
            if (rating > 0 && rating < 1) res.push(1)
            if (rating < 0) res.push(0)
            if (rating === 0) res.push(0)
            rating = rating - 1
        }
        return res
    }

    this.getCommentsCountStr = (count) => {
        const reviewsCount = count
        const word = reviewsCount === 0 ? 'отзывов' : reviewsCount === 1 ? 'отзыв' : reviewsCount > 1 && reviewsCount <= 4 ? 'отызва' : 'отзывов'
        return `(${reviewsCount} ${word})`
    }

    this.initJobs = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_worker) {
                const resumes = await this.getResumes()
                if (resumes.success) {
                    this.setResumes(resumes.data)
                }
            }
        }

        await this.filterJobs()
    }

    this.initResumes = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_customer) {
                const customerJobs = await this.getJobs({user_id: user.data.id, page: 0, limit: 1000000})
                if (customerJobs.success) {
                    Alpine.store('main').customerJobs = customerJobs.data
                }
            }
        }

        await this.filterResumes()
    }

    this.initResumePage = async (id) => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_customer) {
                const customerJobs = await this.getJobs({user_id: user.data.id, page: 0, limit: 1000000})
                if (customerJobs.success) {
                    Alpine.store('main').customerJobs = customerJobs.data
                }
            }
        }


        await this.getResume(id)
        const reviews = await this.getReviewsAboutWorker({resume_id: id})
        if (reviews.success) {
            Alpine.store('main').reviews = reviews.data
            Alpine.store('main').reviewsCount = reviews.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').reviewsCount, Alpine.store('main').reviews_filters)
            Alpine.store('main').reviews_pagination = pagination
        }
    }

    Alpine.bind('checkboxInput', {
        type: 'button',
        checked: false,
        selected: [],
        '@init'(e) {
            console.log(e)
        },
        '@click'(e) {
            let checked = !e.currentTarget.classList.contains('checked')
            e.currentTarget.classList.toggle('checked')

            const item = e.currentTarget.closest('.multiselect-item').querySelector('.multiselect-name')
            const id = item.getAttribute('id').split('_item_')[1]
            const select = e.currentTarget.closest('.multiselect').querySelector('select')
            let selected = Array.from(select.options);
            if (checked) {
                selected.forEach(function (option) {
                    if (option.value === id) {
                        option.selected = true;
                    }

                });
            } else {
                selected.forEach(function (option) {
                    if (option.value === id) {
                        option.selected = false;
                    }

                });
            }

        },


    })


}