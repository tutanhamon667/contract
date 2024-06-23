const alpineApp = function() {

    const showLoader = (show) => {
        const loader = document.querySelector('.loader-container')
        show ? loader.classList.remove('hidden') : loader.classList.add('hidden')
    }

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



    const confirmationModal = (message, title, callback) => {
        var modal = new bootstrap.Modal(document.getElementById('сonfiremationModal'), {
            keyboard: true
        });
        var modalContent = document.getElementById('сonfiremationModal').querySelector('.modal-body')
        var modalTitle = document.getElementById('сonfiremationModal').querySelector('.modal-title')
        var okBtn = document.getElementById('сonfiremationModal').querySelector('#confOkButton')

        okBtn.onclick = () => {
            callback()
            modal.hide();
        }

        modalContent.textContent = message
        modalTitle.textContent = title

        modal.show();
    }

    this.confirmationModal = confirmationModal

    const alertModal = (message, callback) => {
        var modal = new bootstrap.Modal(document.getElementById('error-modal'), {
            keyboard: false
        });
        var modalContent = document.getElementById('error-modal').querySelector('.modal-body')
        var modalTitle = document.getElementById('error-modal').querySelector('.modal-title')
        if (callback) {
            var okBtn = document.getElementById('error-modal').querySelector('#notofyModalOkButton')

            okBtn.onclick = () => {
                callback()
                modal.hide();
            }

        }

        modalContent.textContent = message
        modalTitle.textContent = 'Ошибка'

        modal.show();
    }
    this.alertModal = alertModal

    const makeRequest = async function(url, data) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        return new Promise((resolve, reject) => {
            showLoader(true)
            $.ajax({
                url: `/api/${url}`,
                data: data,
                beforeSend: function(request) {
                    request.setRequestHeader("X-CSRFToken", csrftoken);
                },
                method: "POST",
                success: (data) => {
                    showLoader(false)
                    resolve(data)
                },
                error: (error) => {
                    showLoader(false)
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
        balance: {
            formatString: () => {
                return Alpine.store('main').balance.usd + ' $ / ' + Alpine.store('main').balance.btc + ' BTC'
            }
        },
        responsesInvites: [],
        resumes: [],
        filters: {
            page: 0,
            limit: 3
        },
        reviews_filters: {
            page: 0,
            limit: 3
        },
        pagination: [],
        reviews_pagination: [],
        selectExtended: {},
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
                pagination[key] = {
                    text: key,
                    active: filters.page === key
                }
            }
            return pagination
        },
        getRegionsStr: (job, hide_many = true) => {
            if (!job.is_offline) {
                if (hide_many) {
                    if (!job.regions) {
                        return 'Онлайн занятость'
                    }
                    if (job.regions && job.regions.length > 3) {
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
            return makeRequest('response_invite', {
                action: action,
                id: id
            })
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
            return makeRequest('response_invite', {
                action: action,
                id: id,
                job_id: job_id,
                resume_id: resume_id
            })
        },
        sendInvite: async (action, id, resume_id, job_id) => {
            return makeRequest('response_invite', {
                action: action,
                id: id,
                job_id: job_id,
                resume_id: resume_id
            })
        },
        getResumes: async () => {
            return makeRequest('user_resumes', {})
        },
        setResumes: (data) => {
            Alpine.store('main').resumes = data
        },
        setFavorite: async (job_id) => {
            return makeRequest('favorite', {
                job_id: job_id
            })
        },
        getResponseInviteElement: (invite) => {
            const user = Alpine.store('main').user
            if (user.id >= 0) {
                // 1 - принято с двух сторон
                if (invite.status === 1) {
                    return {
                        element: 'link',
                        link: '/chat/' + invite.chat.uuid,
                        text: 'Перейти в чат'
                    }
                }
                if (invite.status === 2) {
                    return {
                        element: 'status',
                        text: 'Отклик отклонён'
                    }
                }
                if (invite.status === 3) {
                    return {
                        element: 'status',
                        text: 'Отклик удалён'
                    }
                }
                // 0 - нет отклика
                if (invite.status === 0) {
                    // 0 - приглашение от работодателя
                    if (invite.type === 1) {
                        return {
                            element: 'form',
                            text: 'Работодатель вас пригласил на собеседование',
                            actions: [{
                                action: "accept",
                                text: 'Принять приглашение'
                            }, {
                                action: "decline",
                                text: 'Отклонить приглашение'
                            }],
                            id: invite.id
                        }
                    }
                    if (invite.type === 0) {
                        return {
                            element: 'status',
                            text: 'Ждёт подтверждение от работодателя'
                        }
                    }
                }
                if (typeof invite.id === 'undefined') {
                    if (Alpine.store('main').resumes.length) {
                        return {
                            element: 'form',
                            text: '',
                            actions: [{
                                action: "create",
                                text: 'Откликнуться'
                            }],
                            id: null
                        }
                    } else {
                        return {
                            element: 'link',
                            link: '/profile/resume',
                            text: 'Создать резюме для отклика'
                        }
                    }

                }
            }
            return ''
        },

        getResponseInviteExtraElement: (invite) => {
            const user = Alpine.store('main').user

            const getAction = function(invite, user) {
                const actions = []
                if (typeof invite.id === 'undefined') {
                    if (Alpine.store('main').resumes.length) {
                        actions.push({
                            element: 'form',
                            text: '',
                            actions: [{
                                action: "create",
                                text: 'Откликнуться'
                            }],
                            id: null
                        })
                    } else {
                        actions.push({
                            element: 'link',
                            link: '/profile/resume',
                            text: 'Создать резюме для отклика'
                        })
                    }
                    return actions
                }
                if (invite.status === 1) {
                    return [{
                            element: 'form',
                            text: '',
                            actions: [{
                                action: "decline",
                                text: 'Отказатсья',
                                class: 'red'
                            }],
                            id: invite.id
                        },
                        {

                            element: 'link',
                            link: '/chat/' + invite.chat.uuid,
                            text: 'Перейти в чат'

                        }
                    ]
                }

                if (user.is_customer) {
                    if (invite.type === 0) {
                        if (invite.status === 0) {
                            actions.push({
                                element: 'form',
                                text: '',
                                actions: [{
                                    action: "accept",
                                    text: 'Принять '
                                }, {
                                    action: "decline",
                                    text: 'Отклонить '
                                }],
                                id: invite.id
                            })
                        }
                        if (invite.status === 2) {

                            actions.push({
                                element: 'status',
                                text: 'Отклик отклонён'
                            })
                        }
                        if (invite.status === 1) {
                            // перейти в чат
                            actions.push({
                                element: 'link',
                                link: '/chat/' + invite.chat.uuid,
                                text: 'Перейти в чат'
                            })
                        }

                        //                        можем удалить, перейти в чат
                    } else if (invite.type === 1) {
                        if (invite.status === 0) {
                            actions.push({
                                element: 'form',
                                text: '',
                                actions: [{
                                    action: "decline",
                                    text: 'Отменить '
                                }],
                                id: invite.id
                            })
                            actions.push({
                                element: 'status',
                                text: 'Ждёт отклика'
                            })
                        }

                        if (invite.status === 2) {
                            actions.push({
                                element: 'status',
                                text: 'Отклик отклонён'
                            })
                            //                        можем удалить
                        }
                        if (invite.status === 1) {
                            actions.push({
                                element: 'link',
                                link: '/profile/resume',
                                text: 'Создать резюме для отклика'
                            })
                        }
                        // могу отказаться

                    }

                }
                if (user.is_worker) {
                    if (invite.type === 1) {
                        if (invite.status === 0) {
                            actions.push({
                                element: 'form',
                                text: '',
                                actions: [{
                                    action: "accept",
                                    text: 'Принять '
                                }, {
                                    action: "decline",
                                    text: 'Отклонить '
                                }],
                                id: invite.id
                            })
                        }
                        if (invite.status === 2) {

                            actions.push({
                                element: 'status',
                                text: 'Отклик отклонён'
                            })
                        }
                        if (invite.status === 1) {
                            // перейти в чат
                            actions.push({
                                element: 'link',
                                link: '/chat/' + invite.chat.uuid,
                                text: 'Перейти в чат'
                            })
                        }

                        //                        можем удалить, перейти в чат
                    } else if (invite.type === 0) {
                        if (invite.status === 0) {
                            actions.push({
                                element: 'form',
                                text: '',
                                actions: [{
                                    action: "decline",
                                    text: 'Отменить '
                                }],
                                id: invite.id
                            })
                            actions.push({
                                element: 'status',
                                text: 'Ждёт отклика'
                            })
                        }

                        if (invite.status === 2) {
                            actions.push({
                                element: 'status',
                                text: 'Отклик отклонён'
                            })
                            //                        можем удалить
                        }
                        if (invite.status === 1) {
                            actions.push({
                                element: 'link',
                                link: '/profile/resume',
                                text: 'Создать резюме для отклика'
                            })
                        }
                        // могу отказаться

                    }

                }

                return actions

            }
            return getAction(invite, user)
            if (user.id >= 0) {




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

        getResponseInviteResumeElement: (invite) => {
            const user = Alpine.store('main').user
            if (user.id >= 0) {
                if (invite.status === 1) {
                    const chat_uuid = invite.chat ? invite.chat.uuid : ''
                    return {
                        element: 'link',
                        link: '/chat/' + chat_uuid,
                        text: 'Перейти в чат'
                    }
                }
                if (invite.status === 2) {
                    return {
                        element: 'status',
                        text: 'Отклик отклонён'
                    }
                }
                if (invite.status === 3) {
                    return {
                        element: 'status',
                        text: 'Отклик удалён'
                    }
                }
                if (invite.status === 0) {
                    if (invite.type === 0) {
                        return {
                            element: 'form',
                            text: '',
                            actions: [{
                                action: "accept",
                                text: 'Начать чат с кандидатом',
                                class: 'btn btn-primary'
                            }, {
                                action: "decline",
                                text: 'Отказаться',
                                class: 'btn btn-danger'
                            }],
                            id: invite.id
                        }
                    }
                    if (invite.type === 1) {
                        return {
                            element: 'status',
                            text: 'Ждёт подтверждение от соискателя'
                        }
                    }
                }
                if (typeof invite.id === 'undefined') {
                    if (Alpine.store('main').customerJobs.length) {
                        return {
                            element: 'form',
                            text: 'Выберете вакансию для приглашения',
                            actions: [{
                                action: "create",
                                text: 'Пригласить'
                            }],
                            id: null
                        }
                    } else {
                        return {
                            element: 'link',
                            link: '/profile/jobs',
                            text: 'Создать вакансию для приглашения'
                        }
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
    this.createWorkerReview = async (el) => {
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
        object["resume_id"] = Alpine.store('main').resume.id
        const result = await makeRequest('create_worker_review', object)
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
    }
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
        return makeRequest('job', {
            id: id
        })
    }

    this.getCompany = async (id) => {
        return makeRequest('company', {
            id: id
        })
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
                alertModal(res.msg)
            }
        }
    }
    this.updateResponse = async (action, id) => {

        const result = await Alpine.store('main').sendResponseInvite(action, id)
        if (result.success === true) {
            await this.setRIFilters({})
            await this.getCounters()
        }
    }
    this.sendResponse = async (action, id, job_id) => {

        const selectedItem = Alpine.store('main').selectedResume || Alpine.store('main').resumes[0].id
        const result = await Alpine.store('main').sendResponseInvite(action, id, job_id, selectedItem)
        if (result.success === true) {
            const job = Alpine.store('main').job && Alpine.store('main').job.id === job_id ?
                Alpine.store('main').job : Alpine.store('main').jobs.find((i, index) => {
                    return i.id === job_id
                })
            if (job) {
                let msg = ""
                if (action === "create") {
                    msg = "Ваш отклик успешно отправлен!"
                }
                result.data.msg = msg
                job.invite = result.data

            } else {
                alertModal(res.msg)
            }
        }
    }

    this.sendInvite = async (action, id, resume_id) => {
        const selectedItem = Alpine.store('main').selectedJob || Alpine.store('main').customerJobs[0].id
        const result = await Alpine.store('main').sendInvite(action, id, resume_id, selectedItem)
        if (result.success === true) {
            let resume = Alpine.store('main').resume && Alpine.store('main').resume.id === resume_id ?
                Alpine.store('main').resume : Alpine.store('main').filtered_resumes.find((i, index) => {
                    return i.id === resume_id
                })

            if (resume) {
                let msg = ""
                if (action === "create") {
                    msg = "Ваш приглашение успешно отправлено!"
                }
                result.data.msg = msg
                resume.invite = result.data

            } else {
                alertModal(res.msg)
            }
        }
    }

    this.setFavorite = async (job_id) => {
        const result = await Alpine.store('main').setFavorite(job_id)
    }


    this.setReviewsPage = async (page, isWorkerReviews = false) => {
        let object = {
            "page": page,
            limit: Alpine.store('main').reviews_filters.limit,
        };
        if (!isWorkerReviews) {
            object = Object.assign(object, {
                company_id: Alpine.store('main').company.id
            })
        } else {
            object = Object.assign(object, {
                resume_id: Alpine.store('main').resume.id
            })
        }
        Alpine.store('main').reviews_filters = object
        let reviews = null
        if (!isWorkerReviews) {
            reviews = await this.getCompanyReviews(object)
        } else {
            reviews = await this.getReviewsAboutWorker(object)
        }
        if (reviews.success) {
            Alpine.store('main').reviews = reviews.data
            Alpine.store('main').reviewsCount = reviews.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').reviewsCount, Alpine.store('main').reviews_filters)
            Alpine.store('main').reviews_pagination = pagination
        }
    }

    this.setJobsPage = async (page) => {
        const object = {
            "page": page,
            limit: Alpine.store('main').filters.limit
        };
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
            alertModal(res.msg)
        }
    }

    this.setResumesPage = async (page) => {
        const object = {
            "page": page,
            limit: Alpine.store('main').filters.limit
        };
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
            alertModal(res.msg)
        }
    }

    this.getOperationDescription = (transaction) => {
        let action = ''
        let target = ''
        if (transaction.type === "OUTGOING") {
            action = 'Оплата '
            if (transaction.reason_content_type === 30) {
                target = 'размещения вакансии. '
            } else {
                target = 'доступа к базе резюме. '
            }
            description = `Номер операции: ${transaction.id}`
        } else {
            action = 'Пополнение баланса.<br> '
            description = `Hash транзакции: ${transaction.txid}`
        }
        return `${action} ${target} ${description}`

    }

    this.filterResumes = async (filters = {}) => {
        Alpine.store('main').filters.page = 0
        let object = {
            "page": Alpine.store('main').filters.page,
            limit: Alpine.store('main').filters.limit
        };
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
            alertModal(res.msg)
        }
    }



    this.setTransactionPage = async (page) => {
        const object = {
            "page": page,
            limit: Alpine.store('main').filters.limit
        };


        Alpine.store('main').filters = object
        const res = await makeRequest('get_user_transactions', object)
        if (res.success) {
            Alpine.store('main').transactions = res.data.transactions
            Alpine.store('main').transactionsCount = res.data.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').transactionsCount, Alpine.store('main').filters)
            this.setPagination(pagination)
        } else {
            alertModal(res.msg)
        }
    }



    this.getUserTransactions = async (filters = {}) => {
        Alpine.store('main').filters.page = 0
        let object = {
            "page": Alpine.store('main').filters.page,
            limit: Alpine.store('main').filters.limit
        };
        object = Object.assign(object, filters)

        const res = await makeRequest('get_user_transactions', object)
        if (res.success) {
            Alpine.store('main').transactions = res.data.transactions
            Alpine.store('main').transactionsCount = res.data.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').transactionsCount, Alpine.store('main').filters)
            this.setPagination(pagination)
        } else {
            alertModal(res.msg)
        }
    }

    this.getFavoriteJobs = async (filters = {}) => {
        Alpine.store('main').filters.page = 0
        let object = {
            "page": Alpine.store('main').filters.page,
            limit: Alpine.store('main').filters.limit
        };
        object = Object.assign(object, filters)

        const res = await Alpine.store('main').getFavoriteJobs(object)
        if (res.success) {
            this.setJobs(res.data)
            /* this.setJobsCount(res.count)
             const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').jobCount, Alpine.store('main').filters)
             this.setPagination(pagination)*/
        } else {
            alertModal(res.msg)
        }
    }

    this.filterJobs = async (filters = {}) => {
        Alpine.store('main').filters.page = 0
        let object = {
            "page": Alpine.store('main').filters.page,
            limit: Alpine.store('main').filters.limit
        };
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
            alertModal(res.msg)
        }
    }

    this.getBalance = async () => {
        const data = await Alpine.store('main').getBalance()
        if (data.success) {
            Alpine.store('main').balance.usd = data.data.usd
            Alpine.store('main').balance.btc = data.data.btc
            Alpine.store('main').balance.address = data.data.address

        }
    }

    this.initFavoriteJobs = async () => {
        const jobs = await this.getFavoriteJobs()
        if (jobs.success) {
            this.setJobs(jobs.data)
        }
    }


    this.walletPageInit = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            const jobs = await this.getUserTransactions()
        }
    }


    this.getJob = async (id, data = {}) => {
        const res = await makeRequest('job', {
            id: id,
            ...data
        })
        if (res.success) {
            this.setJob(res.data)
        } else {
            alertModal(res.msg)
        }
    }

    this.getResume = async (id) => {
        const res = await makeRequest('resume', {
            id: id
        })
        if (res.success) {
            Alpine.store('main').resume = res.data
        } else {
            alertModal(res.msg)
        }
    }
    this.getContacts = async () => {
        const res = await makeRequest('contacts', {})
        if (res.success) {
            Alpine.store('main').contacts = res.data
        } else {
            alertModal(res.msg)
        }
    }

    this.getResumeStatistics = async (id) => {
        const res = await makeRequest('resume_statistics', {
            id: id
        })
        if (res.success) {
            const ri_arr = res.data.invites.concat(res.data.responses)
            const chats = ri_arr.filter(i => i.type === 1 || i.type === 2).length
            Alpine.store('main').resume_statistics = {
                created_at: res.data.created_at,
                responses: res.data.responses,
                invites: res.data.invites,
                chats: chats && res.data.responses.length ? chats / (res.data.responses.length + res.data.invites.length) * 100 : 0
            }
        } else {
            alertModal(res.msg)
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
        const reviews = await this.getCompanyReviews({
            company_id: id
        })
        if (reviews.success) {
            Alpine.store('main').reviews = reviews.data
            Alpine.store('main').reviewsCount = reviews.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').reviewsCount, Alpine.store('main').reviews_filters)
            Alpine.store('main').reviews_pagination = pagination
        }
    }
    this.formatTransactionDate = (timestamp) => {
        const d = new Date(parseInt(timestamp) * 1000)
        return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear() + ' в ' + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)
    }
    this.formatIncomeValue = (value) => {
        return parseFloat(value / 10000000).toFixed(8)
    }
    this.formatOutgoingValue = (value) => {
        return parseFloat(value).toFixed(8)
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

    this.initFavoriteJobsPage = async () => {
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

        await this.initFavoriteJobs()
    }

    this.getTableDateOrderEl = (filters) => {
        if (filters.order === "desc") {
            return "<button @click='application.setRIFilters({order: \"asc\"})'>Дата ↑</button>"
        } else {
            return "<button @click='application.setRIFilters({order: \"desc\"})'>Дата ↓</button>"
        }
    }


    this.getWorkerResponsesInvites = async (filters = {}) => {

        let object = {
            "page": Alpine.store('main').filters.page,
            limit: Alpine.store('main').filters.limit
        };
        object = Object.assign(object, filters)
        Alpine.store('main').filters = object
        const res = await makeRequest("respones_invites", object)
        if (res.success) {
            Alpine.store('main').responsesInvites = res.data
            Alpine.store('main').responsesInvitesCount = res.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').responsesInvitesCount, Alpine.store('main').filters)
            this.setPagination(pagination)
            await this.getCounters()
        } else {
            alertModal(res.msg)
        }
    }

    this.setRIFilters = async (filters) => {
        Alpine.store('main').responsesInvites = []
        Alpine.store('main').responsesInvitesCount = 0
        let object = Object.assign(Alpine.store('main').filters, filters)
        await this.getWorkerResponsesInvites(object)
    }

    this.initCustomerResponsesInvitesPage = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
        }
        const initFilters = {
            page: 0,
            limit: 3,
            status: 1,
            order: "desc"
        }
        await this.getWorkerResponsesInvites(initFilters)
    }

    this.initWorkerResponsesInvitesPage = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
        }
        const initFilters = {
            page: 0,
            limit: 3,
            status: 1,
            order: "desc"
        }
        await this.getWorkerResponsesInvites(initFilters)
    }

    this.initResumes = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_customer) {
                const customerJobs = await this.getJobs({
                    user_id: user.data.id,
                    page: 0,
                    limit: 1000000
                })
                if (customerJobs.success) {
                    Alpine.store('main').customerJobs = customerJobs.data
                }
            }
        }

        await this.filterResumes()
    }

    this.initUserResumes = async () => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            const resumes = await this.getResumes()
            if (resumes.success) {
                Alpine.store('main').user_resumes = resumes.data
            }
        }
    }


    this.getRIToggleBtnClass = (type, status) => {
        const filters = Alpine.store('main').filters
        if (filters.type == type && filters.status === status) {
            return 'btn-primary'
        } else {
            return 'btn-white'
        }
    }

    this.getTextWithCounter = (text, count) => {

    }

    this.getCounters = async () => {
        const counters = await makeRequest('get_counters')
        if (counters.success) {
            Alpine.store('main').counters = counters.data
        }
    }




    this.initJobPayment = async (id) => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)

        }

        await this.getJob(id, {
            'profile': true
        })
    }

    this.initResumePage = async (id) => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            if (user.data.is_customer) {
                const customerJobs = await this.getJobs({
                    user_id: user.data.id,
                    page: 0,
                    limit: 1000000
                })
                if (customerJobs.success) {
                    Alpine.store('main').customerJobs = customerJobs.data
                }
            }
        }

        await this.getResume(id)
        await this.getResumeStatistics(id)

        const reviews = await this.getReviewsAboutWorker({
            resume_id: id
        })
        if (reviews.success) {
            Alpine.store('main').reviews = reviews.data
            Alpine.store('main').reviewsCount = reviews.count
            const pagination = Alpine.store('main').createPaginationArray(Alpine.store('main').reviewsCount, Alpine.store('main').reviews_filters)
            Alpine.store('main').reviews_pagination = pagination
        }
    }

    this.initProfileResumePage = async (id) => {
        const user = await this.getUser()
        if (user.success) {
            this.setUser(user.data)
            await this.getResume(id)
            await this.getContacts()
        }

    }

    calcTierCost = async () => {
        const res = await makeRequest('calc_tier_payment', {
            job_id: Alpine.store('main').job.id,
            tier: Alpine.store('main').selectExtended['tier'].selected,
            amount: Alpine.store('main').selectExtended['amount'].selected
        })
        if (res.success && res.code === 200) {
            Alpine.store('main').tier_cost = res.data
        } else {
            alertModal(res.msg)
        }
    }

    this.initSelectExtended = (name, values, selected) => {
        Alpine.store('main').selectExtended[name] = {
            selected: selected,
            values: values,
            name: name
        }
        if (Alpine.store('main').job) {
            calcTierCost()
        } else {
            const runner = () => {
                setTimeout(() => {
                    if (Alpine.store('main').job) {
                        calcTierCost()
                    } else {
                        runner()
                    }

                }, 1000)
            }
            runner()
        }

    }

    const getOptionById = (name, value) =>
        document.querySelector(`#${name} > option[value="${value}"]`);



    Alpine.bind('payTierBtn', {
        type: 'button',
        checked: false,
        selected: [],
        '@init'(e) {
            console.log(e)
        },
        '@click'(e) {
            e.preventDefault()
            if (Alpine.store('main').tier_cost.can_spend == 1) {
                confirmationModal('Подтвердите действие', 'Оплата тарифа', () => {
                    const form = document.getElementById('paymentForm')
                    form.submit()
                })
            }
        }
    })

    this.copyToClipboard = (text) => {
        function copyTextToClipboard(text) {

        }
        var copyText = document.getElementById("btc_address");

        var range = document.createRange();
        range.selectNode(copyText);
        window.getSelection().addRange(range);
        try {
            // Now that we've selected the anchor text, execute the copy command
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy email command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        window.getSelection().removeAllRanges();
    }

    customerAccessPay = async () => {
        const res = await makeRequest('access_payment', {})
        if (res.success && res.code === 200) {
            alertModal('Подписка оплачена до: ' + this.formatShortDate(res.data.expire_at), () => {
                window.location.reload()
            })
        } else {
            alertModal(res.msg)
        }
    }
    Alpine.bind('customerAccessBtn', {
        type: 'button',
        checked: false,
        selected: [],
        '@init'(e) {
            console.log(e)
        },
        '@click'(e) {
            e.preventDefault()
            confirmationModal('Подтвердите действие', 'Оплата доступа', () => {
                customerAccessPay()
            })
        }
    })

    Alpine.bind('selectExtendedItem', {
        type: 'button',
        checked: false,
        selected: [],
        '@init'(e) {
            console.log(e)
        },
        '@click'(e) {
            const id = e.currentTarget.id.split('_item_')[1]
            const name = e.currentTarget.id.split('_item_')[0]
            Alpine.store('main').selectExtended[name].selected = id
            Alpine.store('main').selectExtended[name].values.forEach(function(option) {
                option.selected = option.id == id
            })
            getOptionById(name, id).selected = true;
            toggleSelectExtended(e)
            calcTierCost()
        }
    })

    const toggleSelectExtended = (e) => {

        const item = e.currentTarget.closest('.select-extended')
        const expandContainer = item.querySelector('.select-extended-expand-container')
        if (expandContainer.classList.contains('hidden')) {
            e.currentTarget.focus();
        }
        expandContainer.classList.toggle('hidden')
    }

    this.closeSelectExtended = () => {

        const expandContainers = document.querySelector('.select-extended-expand-container')
        for (let i = 0; i < expandContainers.length; i++) {
            if (expandContainers[i].classList.contains('hidden')) continue
            expandContainers[i].classList.add('hidden')
        }

    }

    Alpine.bind('selectExtendedBtn', {
        type: 'button',
        checked: false,
        selected: [],
        '@blur'(e) {
            e.addEventListener("blur", function() {
                // Code to execute when the element loses focus
                toggleSelectExtended(e)
            });
        },
        '@click'(e) {
            toggleSelectExtended(e)
        }
    })

    Alpine.bind('cardLink', {
        type: 'button',

        '@click'(e) {
            let link = e.currentTarget.getAttribute('href')
            if (link)
                window.location.href = link
        }
    })
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
                selected.forEach(function(option) {
                    if (option.value === id) {
                        option.selected = true;
                    }

                });
            } else {
                selected.forEach(function(option) {
                    if (option.value === id) {
                        option.selected = false;
                    }

                });
            }

        },


    })
}