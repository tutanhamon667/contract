document.addEventListener('alpine:init', () => {
    const chatSocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/chat/main/')

    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);

        if (data.type === "CHAT_LIST") {
            Alpine.store('chatsData').chats = data.chats
            selectChat(null)
        }
        if (data.type === "CHAT_MESSAGE") {
            Alpine.store('chatsData').currentChatMessages.push({
                message: data.message,
                sender: data.sender,
                date: data.date,
                chat_uuid: data.chat_uuid
            })
            setTimeout(() => {
                document.querySelector('.chat-history ul').scroll(0, 10000000000000)
            }, 100)
        }

        if (data.type === "CHAT_MESSAGES") {
            Alpine.store('chatsData').currentChatMessages = data.messages
            setTimeout(() => {
                document.querySelector('.chat-history ul').scroll(0, 10000000000000)
            }, 100)
        }


    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    };

    Alpine.store('chatsData', {
        currentChat: null,
        chats: [],
        currentChatMessages: [],
        message: "",
        getOtherUser: () => {
            let res = Alpine.store('chatsData').chats.find(function (item) {
                return item.chat_uuid === Alpine.store('chatsData').currentChat
            })
            if (!res) {
                res = {other_user: {photo: '', display_name: ''}}
            }
            return res
        }
    })

    Alpine.bind('chat_text_input', {
        type: 'text',
        '@click'(e) {
            console.log(e)
        },
        '@keypress'(event) {
            if (event.key === 'Enter') {
                if (Alpine.store('chatsData').message)
                    chatSocket.send(JSON.stringify({
                        type: 'SEND_MESSAGE',
                        chat_uuid: Alpine.store('chatsData').currentChat,
                        message: Alpine.store('chatsData').message
                    }))
                Alpine.store('chatsData').message = ''
            }

        }
    })
    Alpine.bind('chat_item', {
        '@click'(event) {

            Alpine.store('chatsData').currentChat = event.srcElement.closest("li").id
            selectChat(Alpine.store('chatsData').currentChat)

            //Alpine.store('chatsData').chats.find()
        },
    })

    const selectChat = (id) => {
        if (!id) {
            if (Alpine.store('chatsData').chats.length) {
                id = Alpine.store('chatsData').chats[0].chat_uuid
                Alpine.store('chatsData').currentChat = id
            }
        }
        chatSocket.send(JSON.stringify({type: 'JOIN_CHAT', chat_uuid: id}))

        const messages = Alpine.store('chatsData').chats.filter(function (item) {
            return item.chat_uuid === id
        })
        Alpine.store('chatsData').currentChatMessages = messages.length ? messages[0].messages : []
        setTimeout(() => {
            document.querySelector('.chat-history ul').scroll(0, 10000000000000)
        }, 100)
    }


})