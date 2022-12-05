// application user 
const user = {};

// socket.io
const socket = io.connect();

// auth modal handler
;(() => {
    const authModal = document.querySelector('.modal.auth');
    const okBtn = authModal.querySelector('button');

    okBtn.addEventListener('click', evt => {
        const labels = authModal.querySelectorAll('label');

        labels.forEach(label => {
            const input = label.querySelector('input');
            if (input.value === '') {
                label.classList.add('invalid');
            } else {
                label.classList.remove('invalid');
            }
        });

        const isModalDataInvalid = Array.prototype.some.call(labels, label => label.querySelector('input').value === '');
        if (isModalDataInvalid) return;

        user.name = authModal.querySelector('input[name="name"]').value;
        user.nick = authModal.querySelector('input[name="nick"]').value;

        document.body.classList.remove('overflow-hidden');

        document.querySelector('.header span.greetings').innerHTML = `Hello, ${user.name} (@${user.nick})!`

        socket.emit('new user', user);
   
    });

})();

socket.on('users list', publicUsers);

socket.on('new user', publicUser);

socket.on('my user id', userId => {
    user.id = userId;
});

socket.on('change user status', changeUserStatus);

socket.on('someone is typing', name => {
    document.querySelector('.someone-typed-message').innerHTML = `User @${name} is typing now...`;

    setTimeout(() => {
        document.querySelector('.someone-typed-message').innerHTML = '';
    }, 3000);
});

const usersList = document.getElementById('users-list');

function publicUser(user) {
    const li = document.createElement('li');
    li.classList.add(user.status);
    li.dataset.userId = user.id;

    li.innerHTML = `
            <span class="name">${user.name}</span>
            <span class="nick">@${user.nick}</span>
        `;

    usersList.appendChild(li);
}

function publicUsers(users) {
    Object.values(users).forEach(user => {
        publicUser(user);        
    });
}

const disconnectedMessagePlace = document.querySelector('.disconnected-message');

function changeUserStatus(user) {
    usersList.querySelector(`li[data-user-id="${user.id}"]`).className = user.status;

    if (user.status == 'left') {
        disconnectedMessagePlace.innerHTML = `User @${user.nick} left chat at this moment `;
        setTimeout(() => {
            disconnectedMessagePlace.innerHTML = '';
        }, 1000 * 60);
    }
}

// message input handler
;(() => {
    const messageInputBlock = document.querySelector('.message-wrp');
    const sendBtn = messageInputBlock.querySelector('button');
    const input = messageInputBlock.querySelector('input');

    sendBtn.addEventListener('click', evt => {
        if (input.value === '') {
            messageInputBlock.classList.add('invalid');
            return;
        }

        messageInputBlock.classList.remove('invalid');

        const body = input.value;

        const message = {
            user: user.id,
            body,
            createdAt: Date.now()
        }

        input.value = '';

        socket.emit('new message', message);

    });

    input.addEventListener('input', evt => {
        socket.emit('i am typing', user.name);
    });

})();

socket.on('message history', publicPosts);

socket.on('new message', publicPost);

postsEl = document.getElementsByClassName('posts')[0];

function publicPost(post) {
    const postElWrp = document.createElement('li');
    postElWrp.classList.add('col');

    const postEl = document.createElement('div');
    postEl.classList.add('post');

    const bodyWords = post.body.split(' ');
    if (bodyWords.includes('@' + user.nick)) {
        postEl.classList.add('active');
    }

    postEl.innerHTML = `
        <div class="post-header">
            <div class="name-wrp">
                <span class="name">${post.user.name}</span>
                <span class="nick">@${post.user.nick}</span>
            </div>
            <span class="time">${moment(post.createdAt).format("MMM Do YY, h:mm:ss")}</span>
        </div>
        <div class="post-body">${post.body}</div>
    `;

    postElWrp.appendChild(postEl);
    postsEl.appendChild(postElWrp);
}

function publicPosts(posts) {
    posts.forEach(post => {       
        publicPost(post);
    });
}