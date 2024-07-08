function Chat(user_id, chat_id) {

    const makeRequest = function(url, data, callback) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        $.ajax({
            url: `/api/${url}`,
            data: data,
            beforeSend: function(request) {
                request.setRequestHeader("X-CSRFToken", csrftoken);
            },
            method: "POST",
            success: (data) => {
                callback(true, data)
            },
            error: (data) => {
                callback(false, data)
            }
        })
    }



    class FileUpload {

        constructor(input) {
            this.input = input
            this.max_length = 1024 * 1024 * 10;
        }

        create_progress_bar() {
            var progress = `<div class="file-icon">
                            <i class="fa fa-file-o" aria-hidden="true"></i>
                        </div>
                        <div class="file-details">
                            <p class="filename"></p>
                            <small class="textbox"></small>
                            <div class="progress" style="margin-top: 5px;">
                                <div class="progress-bar bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
                                </div>
                            </div>
                        </div>`
            document.getElementById('uploaded_files').innerHTML = progress
        }

        upload() {
            this.create_progress_bar();
            this.initFileUpload();
        }

        initFileUpload() {
            this.file = this.input.files[0];
            this.upload_file(0, null);
        }

        //upload file
        upload_file(start, model_id) {
            var end;
            var self = this;
            var existingPath = model_id;
            var formData = new FormData();
            var nextChunk = start + this.max_length + 1;
            var currentChunk = this.file.slice(start, nextChunk);
            var uploadedChunk = start + currentChunk.size
            if (uploadedChunk >= this.file.size) {
                end = 1;
            } else {
                end = 0;
            }
            formData.append('file', currentChunk)
            formData.append('filename', this.file.name)
            $('.filename').text(this.file.name)
            $('.textbox').text("Uploading file")
            formData.append('end', end)
            formData.append('existingPath', existingPath);
            formData.append('nextSlice', nextChunk);
            $.ajaxSetup({
                headers: {
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
                }
            });
            const chat = Alpine.store('chatsData').getActiveChat()
            $.ajax({
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            if (self.file.size < self.max_length) {
                                var percent = Math.round((e.loaded / e.total) * 100);
                            } else {
                                var percent = Math.round((uploadedChunk / self.file.size) * 100);
                            }
                            $('.progress-bar').css('width', percent + '%')
                            $('.progress-bar').text(percent + '%')
                        }
                    });
                    return xhr;
                },

                url: '/chat/upload/' + chat.chat_uuid,
                type: 'POST',
                dataType: 'json',
                cache: false,
                processData: false,
                contentType: false,
                data: formData,
                error: function(xhr) {
                    alert(xhr.statusText);
                },
                success: function(res) {
                    if (nextChunk < self.file.size) {
                        // upload file in chunks
                        existingPath = res.existingPath
                        self.upload_file(nextChunk, existingPath);
                    } else {
                        // upload complete
                        $('.textbox').text(res.data);
                        Alpine.store('chatsData').file_id = res.id
                        alert(res.data)
                    }
                }
            });
        };
    }

    class Socket {
        constructor() {

        }

        connect() {

            this.chatSocket = new WebSocket(
                'ws://' +
                window.location.host +
                '/ws/chat/main/')

        }

        init() {

            this.chatSocket.onerror = (err) => {
                console.error('Socket encountered error: ', err.message, 'Closing socket');
                this.chatSocket.close();
            };
            this.chatSocket.onmessage = (e) => {
                const data = JSON.parse(e.data);


                if (data.type === "CHAT_LIST") {
                    data.chats = data.chats.sort((a, b) => {
                        const _a = a.messages.length ? a.messages[a.messages.length - 1] : {
                            created: null
                        }
                        const _b = b.messages.length ? b.messages[b.messages.length - 1] : {
                            created: null
                        }
                        const aDate = new Date(_a.created);
                        const bDate = new Date(_b.created);
                        return aDate < bDate
                    })
                    Alpine.store('chatsData').chats = data.chats
                    Alpine.store('chatsData').filteredMessages = data.filtered_messages || []
                    if (chat_id !== 'null' && data.chats.length) {
                        selectChat(chat_id)
                    } else {
                        selectChat()
                    }

                }
                if (data.type === "CHAT_MESSAGE") {
                    const chat = Alpine.store('chatsData').getChatByUUID(data.chat_uuid)
                    chat.messages.push({
                        message: data.message,
                        sender: data.sender,
                        file_id: data.file_id,
                        file_path: data.file_path,
                        file_name: data.file_name,
                        created: data.created,
                        chat_uuid: data.chat_uuid,
                        sender_id: data.sender_id,
                        read: data.read
                    })
                    if (chat.active) {
                        chat.not_read_count = chat.messages.filter(i => i.sender_id !== Alpine.store('chatsData').user_id && i.read === false).length
                    } else {
                        chat.not_read_count += 1
                    }

                    setTimeout(() => {
                        scrollChat()
                        const chat = Alpine.store('chatsData').getActiveChat()
                        if (chat && chat.messages.length) {
                            const data = {
                                chat_uuid: chat.chat_uuid,
                                created: chat.messages[chat.messages.length - 1].created,
                                type: "SET_MESSAGE_READ"
                            }
                            this.chatSocket.send(JSON.stringify(data))
                        }
                    }, 100)
                }

                if (data.type === "CHAT_MESSAGES") {
                    const chat = Alpine.store('chatsData').chats.find(item => item.chat_uuid === data.chat_uuid)
                    chat.messages = data.messages
                    setTimeout(() => {
                        scrollChat()

                        const chat = Alpine.store('chatsData').getActiveChat()
                        if (chat && chat.messages.length) {
                            const data = {
                                chat_uuid: chat.chat_uuid,
                                created: chat.messages[chat.messages.length - 1].created,
                                type: "SET_MESSAGE_READ"
                            }
                            this.chatSocket.send(JSON.stringify(data))
                        }
                    }, 100)
                }
                if (data.type === "LEAVE_CHAT") {
                    if (data.sender_id !== user_id) {
                        const data = {
                            chat_uuid: data.chat_uuid,
                            type: "GET_CHAT"
                        }
                        this.chatSocket.send(JSON.stringify(data))
                        Alpine.store('chatsData').updateChatReadMessagesCount(data.chat_uuid, data.not_read_count)
                        const chat = Alpine.store('chatsData').getChatByUUID(data.chat_uuid).messages
                    }

                }
                if (data.type === "CHAT_UPDATED") {
                    if (data.sender_id !== user_id) {
                        const data = {
                            chat_uuid: data.chat_uuid,
                            type: "GET_CHAT"
                        }
                        this.chatSocket.send(JSON.stringify(data))
                        Alpine.store('chatsData').updateChatReadMessagesCount(data.chat_uuid, data.not_read_count)
                        const chat = Alpine.store('chatsData').getChatByUUID(data.chat_uuid).messages
                    }

                }
                if (data.type === "SET_MESSAGE_READ") {
                    Alpine.store('chatsData').updateChatReadMessagesCount(data.chat_uuid, data.not_read_count)
                }

            };

        }
    }

    const socket = new Socket()
    socket.connect()
    socket.init()
    let reconnectInterval = null
    socket.chatSocket.onclose = (e) => {
        socket.chatSocket.close()
        socket.chatSocket = null
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        reconnectInterval = setInterval(() => {
            socket.connect()
            socket.init()
        }, 5000);
    };
    socket.chatSocket.onopen = (e) => {
        reconnectInterval = null
    };
    makeRequest('user', {}, (success, data) => {
        if (data.success) {
            Alpine.store('chatsData').user = data.data
        }
    })



    Alpine.store('chatsData', {
        chats: [],
        user_id: user_id,
        message: "",
        file_id: null,
        getOtherUser: () => {
            let res = Alpine.store('chatsData').chats.find(function(item) {
                return item.chat_uuid === Alpine.store('chatsData').getActiveChat().chat_uuid
            })
            if (!res) {
                res = {
                    other_user: {
                        photo: '',
                        display_name: ''
                    }
                }
            }
            return res
        },

        setActiveChat: (uuid) => {
            Alpine.store('chatsData').chats.forEach(item => item.active = false)
            Alpine.store('chatsData').chats.forEach(item => {
                if (item.chat_uuid === uuid)
                    item.active = true
            })
        },
        updateItem: (chat) => {

        },
        getActiveChat: () => {
            return Alpine.store('chatsData').chats.find(item => item.active === true)
        },
        getOtherPhoto: () => {
            const activeChat = Alpine.store('chatsData').getActiveChat()
            if (activeChat) {
                if (activeChat.other_user.photo) {
                    return activeChat.other_user.photo
                } else {
                    return 'https://via.placeholder.com/40x40'
                }
            }
            return false
        },
        markFiltered: (id) => {
            const filteredMessages = Alpine.store('chatsData').filteredMessages
            if (filteredMessages.find(item => item.id === id)) {
                return 'mark-filtered-msg'
            }
        },
        getSelfPhoto: () => {
            const activeChat = Alpine.store('chatsData').getActiveChat()
            if (activeChat) {
                if (activeChat.self_user.photo) {
                    return activeChat.self_user.photo
                } else {
                    return 'https://via.placeholder.com/40x40'
                }
            }
            return false
        },
        getOtherLink: () => {
            const chat = Alpine.store('chatsData').getActiveChat()
            if (chat && chat.ri) {
                if (chat.other_user.is_worker) {
                    return '/resumes/' + chat.ri.resume
                } else if (!chat.other_user.is_worker && !chat.other_user.is_moderator) {
                    return '/jobs/' + chat.ri.job
                }
            }
            return '#'
        },
        get getActiveChatMessages() {
            const chat = Alpine.store('chatsData').getActiveChat()
            return chat ? chat.messages : []
        },

        getChatByUUID: (uuid) => {
            return Alpine.store('chatsData').chats.find(item => item.chat_uuid === uuid)
        },

        updateChatReadMessagesCount: (uuid, count) => {
            console.log(Alpine.store('chatsData'))
            let chat = Alpine.store('chatsData').getChatByUUID(uuid)
            chat.messages.forEach(item => {
                if (item.sender_id !== Alpine.store('chatsData').user_id && item.read === false)
                    item.read = true
            })
            if (chat.active === false) {
                chat.not_read_count = chat.not_read_count + count
            } else {
                chat.not_read_count = count
            }


        },
        formatShortTime: (date) => {
            const d = new Date(date);
            return ("0" + d.getHours()).slice(-2) + ":" + ("0" + (d.getMinutes() + 1)).slice(-2)
        },

        formatShortDate: (date) => {
            const d = new Date(date);
            return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear()
        },
        sendMessage: () => {
            if (Alpine.store('chatsData').message || Alpine.store('chatsData').file_id) {
                let chat = Alpine.store('chatsData').getActiveChat()
                socket.chatSocket.send(JSON.stringify({
                    type: 'SEND_MESSAGE',
                    chat_uuid: chat.chat_uuid,
                    message_type: Alpine.store('chatsData').file_id ? 2 : 0,
                    file_id: Alpine.store('chatsData').file_id,
                    message: Alpine.store('chatsData').message
                }))
                Alpine.store('chatsData').message = ''
                Alpine.store('chatsData').file_id = null
            }
        }

    })

    Alpine.bind('chat_text_input', {
        type: 'text',
        '@click'(e) {
            console.log(e)
        },
        '@keypress'(event) {
            if (event.key === 'Enter') {
                Alpine.store('chatsData').sendMessage()
            }

        }
    })

    const toggleSelectExtended = () => {
        const chats = document.querySelector('.chats-container')
        const messages = document.querySelector('.chat-container')
        if (chats.classList.contains('expanded')) {
            chats.classList.remove('expanded')
            messages.classList.remove('hidden')
        } else {
            chats.classList.add('expanded')
            messages.classList.add('hidden')
        }
    }


    Alpine.bind('searchChat', {
        type: 'input',
        '@keypress'(event) {
            if (event.key === 'Enter') {
                console.log()
                chat_id = null
                if (event.srcElement.value === '') {
                    socket.chatSocket.send(JSON.stringify({
                        type: 'CHAT_LIST'
                    }))
                } else {
                    socket.chatSocket.send(JSON.stringify({
                        type: 'SEARCH_CHATS',
                        query: event.srcElement.value,
                        chat_uuid: chat.chat_uuid
                    }))
                }
            }




        },

    })
    Alpine.bind('expand_btn', {
        type: 'button',
        '@click'(e) {
            toggleSelectExtended()
        },

    })
    Alpine.bind('chat_submit_btn', {
        type: 'button',
        '@click'(e) {
            Alpine.store('chatsData').sendMessage()
        },

    })
    Alpine.bind('chat_item', {
        '@click'(event) {
            selectChat(event.srcElement.closest('.chats-message-preview').id)
            const chats = document.querySelector('.chats-container')
            if (chats.classList.contains('expanded')) {
                if (window.innerWidth < 768) {
                    toggleSelectExtended()
                } else {
                    chats.classList.remove('expanded')
                    const messages = document.querySelector('.chat-container')
                    messages.classList.remove('hidden')
                }

            }


        },
    })
    Alpine.bind('leaveBtn', {
        '@click'(event) {
            const otherUser = Alpine.store('chatsData').getOtherUser().other_user
            if (otherUser.is_moderator) {
                if (otherUser.display_name === "System Notifications") {
                    return
                }
            } else {

            }
            application.confirmationModal('Вы действительно хотите покинуть чат?', 'Покинуть чат с ' + Alpine.store('chatsData').getOtherUser().other_user.display_name, () => {
                let chat = Alpine.store('chatsData').getActiveChat()
                socket.chatSocket.send(JSON.stringify({
                    type: 'LEAVE_CHAT',
                    chat_uuid: chat.chat_uuid
                }))
            })

        },
    })




    Alpine.bind('file_upload_btn', {
        '@click'(event) {
            event.preventDefault();
            const uploader = new FileUpload(document.querySelector('#fileupload'))
            uploader.upload();

        },
    })

    const scrollChat = () => {
        document.querySelector('.chat-body').scroll(0, 0)
        const markedMessage = document.querySelector('.mark-filtered-msg')
        const chatBodyHeight = document.querySelector('.chat-space').getBoundingClientRect().height
        if (markedMessage) {
            const id = parseInt(document.querySelector('.mark-filtered-msg').id.split("_")[1])
            const rect = markedMessage.getBoundingClientRect();
            let y = 0
            Alpine.store('chatsData').getActiveChat().messages.find((item, ind) => {
                if (item.id === id) {
                    y = rect.height * ind;
                    return true
                }
                return false

            })

            document.querySelector('.chat-body').scroll(0, y)
        } else {
            document.querySelector('.chat-body').scroll(0, chatBodyHeight)
        }
    }

    const selectChat = (id) => {
        if (!id) {
            if (Alpine.store('chatsData').chats.length) {
                id = Alpine.store('chatsData').chats[0].chat_uuid
                Alpine.store('chatsData').setActiveChat(id)
            } else {
                return
            }
        }
        Alpine.store('chatsData').setActiveChat(id)
        socket.chatSocket.send(JSON.stringify({
            type: 'JOIN_CHAT',
            chat_uuid: id
        }))
        const test = Alpine.store('chatsData').chats
        setTimeout(() => {
            scrollChat()
            const chat = Alpine.store('chatsData').getActiveChat()
            if (chat && chat.messages.length) {
                const data = {
                    chat_uuid: id,
                    created: chat.messages[chat.messages.length - 1].created,
                    type: "SET_MESSAGE_READ"
                }
                socket.chatSocket.send(JSON.stringify(data))
            }

        }, 100)
    }


}