const JobsSearch = function() {

        const makeRequest = async function(url, data){
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            return new Promise((resolve, reject) => {
                $.ajax({
                url: `/api/${url}`,
                data: data,
                beforeSend: function(request) {
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

        Alpine.store('main', {
            jobs: [],
            user:{},
            filters: {},
            getJobs: async () => {
                return makeRequest('jobs', {page: 0})
            },
            setJobs: (data) => {
                Alpine.store('main').jobs = data
            },
            getUser: async () => {
                return makeRequest('user', {})
            },
            setUser: (data) => {
                Alpine.store('main').user = data
            },
            getResponseInviteElement: (id) => {
                const user = Alpine.store('main').user
                if (user.id >= 0){
                    const job = Alpine.store('main').jobs.find(el => el.id === id)
                    if (job.invite.status === 1){
                        return 'link'
                    }
                    if (job.invite.status === 0 || job.invite.status === 2){
                        return 'text'
                    }
                    if (typeof job.invite.id === 'undefined'){
                        return 'form'
                    }
                }
                return ''
            },
            getResponseInviteStatus: (id) => {
                const user = Alpine.store('main').user
                if (user.id >= 0){
                    const job = Alpine.store('main').jobs.find(el => el.id === id)
                   if (job.invite.status === 1){
                        return 'link'
                    }
                    if (job.invite.status === 0 || job.invite.status === 2){
                        return 'text'
                    }
                    if (typeof job.invite.id === 'undefined'){
                        return 'form'
                    }
                }
                return ''
            }


        })


        Alpine.bind('chat_text_input', {
            type: 'text',
            '@click'(e) {
                console.log(e)
            },
            '@keypress'(event) {
                if (event.key === 'Enter') {

                }

            }
        })
        Alpine.bind('chat_submit_btn', {
            type: 'button',
            '@click'(e) {

            },

        })
        this.getJobs = async () => {
            return Alpine.store('main').getJobs()
        }

        this.setJobs = (data) => {
            Alpine.store('main').setJobs(data)
        }
        this.getUser = async () => {
            return Alpine.store('main').getUser()
        }

        this.setUser = (data) => {
            Alpine.store('main').setUser(data)
        }

        this.getResponseInviteElement = () => {

        }


}
