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
        user: {},
        jobCount: 0,
        selectedResume: null,
        balance: "",
        resumes: [],
        filters: {page: 0, limit: 3},
        pagination: [],
        getWorkExpString: (value) => {
            switch (value) {
                case 'NoMatter':
                    return 'Без опыта'
                case 'Between1And6':
                    return 'Опыт От 1 до 6 месяцев'
                case 'Between6And12':
                    return 'Опыт От 6 месяцев до 1 года'
                case 'Between12And24':
                    return 'Опыт От 1 до 2 лет'
                case 'More24':
                    return 'Опыт От 2 лет'

            }
        },
        createPaginationArray: () => {
            const arrayLength = Math.ceil(Alpine.store('main').jobCount/Alpine.store('main').filters.limit)
            let pagination = new Array(arrayLength)
            const iterator = pagination.keys();

            for (const key of iterator) {
              pagination[key] = {text:key, active: Alpine.store('main').filters.page == key}
            }
            return pagination
        },
        getRegionsStr: (job, hide_many = true) => {
            if (!job.is_offline){
                if(hide_many){
                    if (job.regions.length > 3) {
                        const length = job.regions.length - 3
                        const regions_to_display = job.regions.slice(0,3)
                        let region_names = regions_to_display.map(i=>i.name).join(', ')
                        return 'Оффлайн занятость: ' + region_names + ' и ещё ' + length
                    }else {
                        let region_names = job.regions.map(i=>i.name).join(', ')
                        return 'Оффлайн занятость: ' + region_names
                    }
                }
                let region_names = job.regions.map(i=>i.name).join(', ')
                return 'Оффлайн занятость: ' + region_names
            }else{
                return 'Онлайн занятость'
            }
        },
        getDepositStr: (job) => {
            if (!job.deposit){
                return 'Без залога'
            }else{
                return `Залог: ${numberWithSpace(job.deposit)} ₽`
            }
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
        getResponseInviteElement: (id) => {
            const user = Alpine.store('main').user
            if (user.id >= 0) {
                const job = Alpine.store('main').jobs.find(el => el.id === id)
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
                    if (Alpine.store('main').resumes.length){
                         return {
                            element: 'form',
                            text: '',
                            actions: [{action: "create", text: 'Откликнуться'}],
                            id: null
                        }
                    }else{
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
        }


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

    this.getJobs = async (filters) => {
        return Alpine.store('main').getJobs(filters)
    }

    this.setJobs = (data) => {
        Alpine.store('main').setJobs(data)
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


        const resume_id = Alpine.store('main').selectedResume
        const result = await Alpine.store('main').sendResponseInvite(action, id, job_id, resume_id)
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
                if (action === "create"){
                    msg = "Ваш отклик успешно отправлен!"
                }
                result.data.msg = msg
                job.invite = result.data

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

    this.setJobsPage =  async (page) => {
        const form = document.querySelector('#filter_form')
        const params = new FormData(form);
        const object = {"page": page, limit: Alpine.store('main').filters.limit};
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
        Alpine.store('main').filters = object
        const res = await this.getJobs(object)
        if (res.success) {
            this.setJobs(res.data)
            this.setJobsCount(res.count)
            const pagination = Alpine.store('main').createPaginationArray()
            this.setPagination(pagination)
        } else {
            alert(res.msg)
        }
    }


    this.filterJobs = async (el) => {
        const form = document.querySelector('#filter_form')
        const params = new FormData(form);
        Alpine.store('main').filters.page = 0
        const object = {"page": Alpine.store('main').filters.page, limit: Alpine.store('main').filters.limit};
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
        const res = await this.getJobs(object)
        if (res.success) {
            this.setJobs(res.data)
            this.setJobsCount(res.count)
            const pagination = Alpine.store('main').createPaginationArray()
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