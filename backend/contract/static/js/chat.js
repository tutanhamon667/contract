document.addEventListener('alpine:init', () => {
    const chatSocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/chat/main/')

    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.chats) {
            Alpine.store('chatsData').chats = JSON.parse(data.chats)
        }
    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    };

    Alpine.store('chatsData', {

        chats: [],
        messages: []
    })

    Alpine.bind('chat_text_input', {
        type: 'text',
        '@click'(e){
             console.log(e)
        },
        '@keypress'(event) {
            if (event.key === 'Enter') {
                console.log(chatSocket)
                console.log('send message')
            }

        }
    })

    })