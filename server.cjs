const path = require('node:path');
const express = require('express');
const app = express();

const { Server } = require('socket.io');



const staticPath = path.normalize(__dirname + '/public');
app.use(express.static(staticPath));

app.get('/', function (req, res) {
    res.sendFile(__dirname + 'index.html');
});
app.get('/css/main.css', function (req, res) {
    res.sendFile(__dirname + 'css/main.css');
});
app.get('/js/main.js', function (req, res) {
    res.sendFile(__dirname + 'js/main.js');
});

const http = require('http');
const server = http.createServer(app).listen(5000, () => {
    console.log('listening on *:5000');    
});

const io = new Server(server);

const users = {};
const messages = [];

io.on('connection', socket => {
    console.log('Client is connected');

    socket.on('new user', user => {
        user.status = 'appeared';
        user.id = socket.id;
       
        users[user.id] = user;

        socket.emit('my user id', user.id);

        io.emit('new user', user);

        setTimeout(() => {
            user.status = 'online';
            io.emit('change user status', user);
        }, 1000 * 60);
    });


    socket.on('new message', msg => {
        messages.push(msg);

        io.emit('new message', getMessageWithAuthor(msg));
    });

    socket.on('i am typing', name => {
        socket.broadcast.emit('someone is typing', name);
    });

    socket.on('disconnect', () => {
        const disconnectedUser = Object.values(users).filter(user => user.id == socket.id)[0];
        
        if(!disconnectedUser) return;

        disconnectedUser.status = 'left';

        io.emit('change user status', disconnectedUser);

        setTimeout(() => {
            disconnectedUser.status = 'offline';
            io.emit('change user status', disconnectedUser);
        }, 1000 * 60);
    });


    socket.emit('message history', getMessagesWithAuthors(messages));
    socket.emit('users list', users);

});


function getMessageWithAuthor(msg) {
    return Object.assign({}, msg, { user: users[msg.user] });
}

function getMessagesWithAuthors(messages) {
    if (messages.length > 100) {
        messages = messages.slice(messages.length - 100);
    }

    return messages.length ? messages.map(msg => getMessageWithAuthor(msg)) : [];
}
